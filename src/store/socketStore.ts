import { Chat, Id, Message } from '@/types';
import { reactive } from '@vue/reactivity';
import { toRefs, inject } from 'vue';
import { handleRead, removeChat, usechatsActions } from './chatStore';
import { useAuthState } from '@/store/authStore';
import { addUserToBlockList } from '@/store/blockStore';
import { createErrorNotification } from '@/store/notificiationStore';
import { getAllPosts, updateSomeoneIsTyping } from '@/services/socialService';
import { getSharedContent } from '@/store/fileBrowserStore';
import { allSocialPosts } from '@/store/socialStore';
import { StatusUpdate } from 'types/status.type';
import { statusList } from './statusStore';

const state = reactive<State>({
    socket: '',
    notification: {
        id: '',
        sound: '',
    },
});

const notify = ({ id, sound = 'beep.mp3' }) => {
    state.notification = {
        id,
        sound,
    };
};

const initializeSocket = (username: string) => {
    state.socket = inject('socket');

    state.socket.on('connect', () => {
        console.log('connected with socket.');
    });
    state.socket.emit('identify', {
        name: username,
    });
    state.socket.on('chat_removed', (chatId: string) => {
        removeChat(chatId);
    });
    state.socket.on('chat_blocked', (chatId: string) => {
        addUserToBlockList(chatId);
    });
    state.socket.on('message', (message: Message<any>) => {
        const { user } = useAuthState();
        if (message.type === 'FILE_SHARE_REQUEST') {
            return;
        }
        if (message.type === 'READ') {
            handleRead(message);
            return;
        }
        if (message.type !== 'SYSTEM' || message.type !== 'EDIT' || message.type !== 'DELETE') {
            notify({ id: message.id });
        }
        const { addMessage } = usechatsActions();

        addMessage(message.to === user.id ? message.from : message.to, message);
    });
    state.socket.on('connection_request', (newContactRequest: Chat) => {
        const { addChat } = usechatsActions();
        addChat(newContactRequest);
    });
    state.socket.on('chat_updated', (chat: Chat) => {
        const { updateChat } = usechatsActions();
        updateChat(chat);
    });
    state.socket.on('new_chat', (chat: Chat) => {
        const { addChat } = usechatsActions();
        addChat(chat);
    });
    state.socket.on('post_typing', (data: { post: string; user: string }) => {
        updateSomeoneIsTyping(data.post, data.user);
    });
    state.socket.on('posts_updated', () => {
        getAllPosts();
    });
    state.socket.on('post_deleted', (postId: string) => {
        allSocialPosts.value = allSocialPosts.value.filter(p => p.post.id !== postId);
    });
    state.socket.on('disconnect', () => {
        createErrorNotification('Connection Lost', 'You appear to be having connection issues');
    });
    state.socket.on('shares_updated', () => {
        getSharedContent();
    });
    state.socket.on('update_status', (status: StatusUpdate) => {
        if (statusList[status.id]) statusList[status.id].isOnline = status.isOnline;
    });
};

const sendSocketMessage = async (chatId: string, message: Message<any>, isUpdate = false) => {
    const data = {
        chatId,
        message,
    };
    const messageType = isUpdate ? 'update_message' : 'message';
    await state.socket.emit(messageType, data);
};

export const sendRemoveChat = async (id: Id) => {
    state.socket.emit('remove_chat', id);
};
export const sendBlockChat = async (id: Id) => {
    state.socket.emit('block_chat', id);
};

const sendSocketUserStatus = async (status: string) => {
    const data = {
        status,
    };
    state.socket.emit('status_update', data);
};

export const useSocketActions = () => {
    return {
        initializeSocket,
        sendSocketMessage,
        sendSocketUserStatus,
        notify,
    };
};

export const useSocketState = () => {
    return {
        ...toRefs(state),
    };
};

interface State {
    socket: any;
    notification: object;
}
