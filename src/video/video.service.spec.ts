import { Test, TestingModule } from '@nestjs/testing';
import { VideoService } from './video.service';
import * as fs from 'fs';
import * as path from 'path';

describe('VideoService', () => {
  let service: VideoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VideoService],
    }).compile();

    service = module.get<VideoService>(VideoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
