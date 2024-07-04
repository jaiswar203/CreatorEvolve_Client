import { IDolbyContenType } from "@/components/Voice/Enhance/Enhance";
import { IResponse } from "../api/auth";
import { IEnhancedAudioStatus } from "./enum";

export interface IUploadYTVideo {
  url: string;
  thumbnail: string;
  name: string;
  quality?: string;
}

export interface IVideoByIdResponse extends IResponse {
  data: {
    created_at: string;
    name: string;
    tl_task_id: string;
    tl_video_id: string;
    type: string;
    updated_at: string;
    url: string;
    user_id: string;
    thumbnail: string;
    __v: number;
    _id: string;
  };
}

export interface IDubs {
  name: string;
  updated_at: string;
  created_at: string;
  url: string;
  _id: string;
  media_key: string;
  status: string;
  target_languages: string[];
}

export interface IDubsList extends IResponse {
  data: IDubs[];
}

export interface IExtractVideo {
  id: string; // video ID
  prompt?: string;
  aspect?: number;
}

export interface IExtractVideoResponse extends IResponse {
  data: IExtractVideoDataInfo[];
}

export interface IChapterRequest {
  id: string;
  prompt?: string;
}

export interface IExtractVideoDataInfo {
  start: number;
  end: number;
  summary: string;
  title: string;
  url: string;
}

export interface IChaptersResponse extends IResponse {
  start: number;
  end: number;
  summary: string;
  title: string;
  id: string;
}

export type MediaType = "video" | "audio";

export interface IDubRequest {
  mediaId: string;
  type: MediaType;
  target_lang: string;
  source_lang?: string;
  highest_resolution: boolean;
  num_speakers: number;
  start_time?: string;
  end_time?: string;
}

interface VoiceLabel {
  accent: string;
  gender: string;
  description: string;
  useCase: string;
  age: string;
}

export interface IVoicesList {
  id: string;
  name: string;
  preview: string;
  labels: VoiceLabel;
}

export interface ISharedVoice {
  id: string;
  name: string;
  preview: string;
  rate: number;
  public_owner_id: string;
}

export interface IVoiceListResponse extends IResponse {
  data: {
    public: IVoicesList[];
    private: IVoicesList[];
  };
}

export interface ISharedVoiceListResponse extends IResponse {
  data: ISharedVoice[];
}

export interface IAddSharedVoiceInLibrary {
  public_owner_id: string;
  voice_id: string;
  name: string;
}

export interface TextToSpeechRequest {
  voice_id: string;
  text: string;
  stability?: number;
  similarity_boost?: number;
  style?: number;
  use_speaker_boost?: boolean;
}

export interface IGenerateRandomVoiceParamResponse extends IResponse {
  data: {
    genders: { name: string; code: string }[];
    accents: { name: string; code: string }[];
    ages: { name: string; code: string }[];
  };
}

export interface IGenerateRandomVoiceRequest {
  gender: string;
  age: string;
  accent: string;
  accent_strength: number;
  text: string;
}

export interface IGenerateRandomVoiceResponse extends IResponse {
  data: {
    preview: string;
    voice_id: string;
  };
}

export interface ISaveRandomGeneratedVoiceRequest {
  generated_voice_id: string;
  labels: { key: string; value: string }[];
  voice_description: string;
  voice_name: string;
  preview_url: string;
}

export interface IEnhanceSettings {
  noise?: {
    reduction?: {
      enable: boolean;
      amount: string | number;
    };
  };
  loudness?: {
    enable: boolean;
    dialog_intelligence?: boolean;
  };
  speech?: {
    isolation?: {
      enable: boolean;
      amount: number;
    };
    sibilance?: {
      reduction?: {
        enable: boolean;
        amount: string | number;
      };
    };
    click?: {
      reduction?: {
        enable: boolean;
        amount: string | number;
      };
    };
    plosive?: {
      reduction?: {
        enable: boolean;
        amount: string | number;
      };
    };
  };
  dynamics?: {
    range_control?: {
      enable: boolean;
      amount: string | number;
    };
  };
  music?: {
    detection?: {
      enable: boolean;
    };
  };
  [media: string]: any;
}

export interface IEnhanceRequest {
  mediaId: string;
  settings: IEnhanceSettings;
  content?: IDolbyContenType;
  type: string;
}

export interface IEnhancedAudio {
  id: string;
  settings: IEnhanceSettings;
  name: string;
  status: IEnhancedAudioStatus;
  url: string;
  created_at: Date;
}

export interface IEnhancedAudiosList extends IResponse {
  data: IEnhancedAudio[];
}

export interface IDiagnosis {
  quality_score: {
    average: number;
    distribution: {
      lower_bound: number;
      upper_bound: number;
      duration: number;
      percentage: number;
    }[];
    worst_segment: {
      start: number;
      end: number;
      score: number;
    };
  };
  noise_score: {
    average: number;
    distribution: {
      lower_bound: number;
      upper_bound: number;
      duration: number;
      percentage: number;
    }[];
  };
  clipping: {
    events: number;
  };
  loudness: {
    measured: number;
    range: number;
    gating_mode: string;
    sample_peak: number;
    true_peak: number;
  };
  music: {
    percentage: number;
  };
  silence: {
    percentage: number;
    at_beginning: number;
    at_end: number;
    num_sections: number;
    silent_channels: number[];
  };
  speech: {
    percentage: number;
    events: {
      plosive: number;
      sibilance: number;
    };
  };
}

export interface IDiagnosisSummary {
  speech: string;
  noise_quality: string;
  voice_quality: string;
}

export interface IDiagnosedAudioListResponse extends IResponse {
  data: {
    id: string;
    name: string;
    created_at: Date;
    diagnosis: IDiagnosis;
    summary: IDiagnosisSummary;
    status: string;
    media_id: string;
    media_type: string;
  }[];
}
