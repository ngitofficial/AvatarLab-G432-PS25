// src/types.ts

export interface Avatar {
  avatar_id: string;
  avatar_name: string;
  preview_image_url: string;
}

export interface Voice {
  voice_id: string;
  name: string;
  language: string;
  preview_audio: string;
}
