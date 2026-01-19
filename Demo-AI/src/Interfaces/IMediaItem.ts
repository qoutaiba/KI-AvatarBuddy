import { MediaType } from '../enums/MediaType';

export interface IMediaItem {
  id: string;
  type: MediaType;
  title: string;
  sourceUrl: string;
  description?: string;
}
