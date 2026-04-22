import { type ReactNode } from 'react';

import { type ICodeBlock, type IVideo, type IYouTubeEmbed, type TTableTheme } from '@/types/common';

export interface IContentYouTube extends IYouTubeEmbed {
  variant?: 'default' | 'outline';
}

export interface IContentCode extends ICodeBlock {
  children?: ReactNode;
}

export interface IContentCodeTabs {
  tabs: ICodeBlock[];
}

export interface IContentVideo extends IVideo {
  variant?: 'default' | 'outline';
}

export type IContentTable = {
  type: 'withTopHeader' | 'withoutHeader';
  theme?: TTableTheme;
};

export interface IContentRelatedPosts {
  title?: string;
}

export interface IContentBlockProps<T> {
  value: T;
}
