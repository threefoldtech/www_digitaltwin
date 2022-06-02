import { Module } from '@nestjs/common';

import { ApiModule } from '../api/api.module';
import { DbModule } from '../db/db.module';
import { LocationModule } from '../location/location.module';
import { YggdrasilModule } from '../yggdrasil/yggdrasil.module';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { PostRedisRepository } from './repositories/post-redis.repository';

@Module({
    imports: [DbModule, LocationModule, YggdrasilModule, ApiModule],
    controllers: [PostController],
    providers: [PostService, PostRedisRepository],
    exports: [PostService],
})
export class PostModule {}
