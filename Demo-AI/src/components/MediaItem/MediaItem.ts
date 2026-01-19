import { MediaType } from '../../enums/MediaType';
import type { IMediaItem } from '../../Interfaces/IMediaItem';

export class MediaItem implements IMediaItem {
  id: string;
  type: MediaType;
  title: string;
  sourceUrl: string;
  description?: string;

  constructor(
    id: string,
    type: MediaType,
    title: string,
    sourceUrl: string,
    description?: string
  ) {
    this.id = id;
    this.type = type;
    this.title = title;
    this.sourceUrl = sourceUrl;
    this.description = description;
  }

  isImage(): boolean {
    return this.type === MediaType.IMAGE;
  }

  isVideo(): boolean {
    return this.type === MediaType.VIDEO;
  }

  isPdf(): boolean {
    return this.type === MediaType.PDF;
  }

  isLink(): boolean {
    return this.type === MediaType.LINK;
  }
}
