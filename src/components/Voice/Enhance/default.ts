import { IEnhanceSettings } from "@/redux/interfaces/media";

export enum IDolbyContenType {
    CONFERENCE = 'conference',
    INTERVIEW = 'interview',
    LECTURE = 'lecture',
    MEETING = 'meeting',
    MOBILE_PHONE = 'mobile_phone',
    MUSIC = 'music',
    PODCAST = 'podcast',
    STUDIO = 'studio',
    VOICE_OVER = 'voice_over',
    VOICE_RECORDING = 'voice_recording',
}

export const dolbyAmount = [
    {
        key: "Low",
        value: "low"
    },
    {
        key: "Medium",
        value: "medium"
    },
    {
        key: "High",
        value: "high"
    },
    {
        key: "Max",
        value: "max"
    },
]



interface Option {
    key: string;
    label: string;
    tooltip: string;
    settings: IEnhanceSettings;
}

export const dolbyContentTypes = [
    { name: 'Conference', value: IDolbyContenType.CONFERENCE },
    { name: 'Interview', value: IDolbyContenType.INTERVIEW },
    { name: 'Lecture', value: IDolbyContenType.LECTURE },
    { name: 'Meeting', value: IDolbyContenType.MEETING },
    { name: 'Mobile Phone', value: IDolbyContenType.MOBILE_PHONE },
    { name: 'Music', value: IDolbyContenType.MUSIC },
    { name: 'Podcast', value: IDolbyContenType.PODCAST },
    { name: 'Studio', value: IDolbyContenType.STUDIO },
    { name: 'Voice Over', value: IDolbyContenType.VOICE_OVER },
    { name: 'Voice Recording', value: IDolbyContenType.VOICE_RECORDING },
];

export const options: Option[] = [
    {
        key: "enhance",
        label: "Enhance",
        tooltip: "General enhancement to improve overall audio quality. Example: Boosts clarity of a podcast.",
        settings: {
            // loudness: { enable: true, dialog_intelligence: true },
            // noise: { reduction: { enable: true, amount: 'auto' } },
            // dynamics: { range_control: { enable: true, amount: 'auto' } },
            // speech: {
            //     isolation: { enable: true, amount: 50 },
            //     sibilance: { reduction: { enable: true, amount: 'auto' } },
            //     click: { reduction: { enable: true, amount: 'auto' } },
            //     plosive: { reduction: { enable: true, amount: 'auto' } }
            // },
            // music: { detection: { enable: true } }
        }
    },
    {
        key: "background-noise-reduction",
        label: "Background noise reduction",
        tooltip: "Reduces unwanted background noise. Example: Minimizes air conditioning noise in a recording.",
        settings: {
            noise: { reduction: { enable: true, amount: 'max' } }
        }
    },
    {
        key: "loudness-control",
        label: "Loudness Control",
        tooltip: "Manages audio loudness levels. Example: Balances volume in a music track.",
        settings: {
            loudness: { enable: true, dialog_intelligence: true }
        }
    },
    {
        key: "speech-isolation",
        label: "Speech Isolation",
        tooltip: "Isolates speech from other sounds. Example: Enhances voice clarity in a meeting recording.",
        settings: {
            speech: { isolation: { enable: true, amount: 50 } }
        }
    },
    {
        key: "dynamic-range-control",
        label: "Dynamic Range Control",
        tooltip: "Adjusts the dynamic range of audio. Example: Evens out volume differences in a dialogue.",
        settings: {
            dynamics: { range_control: { enable: true, amount: 'max' } }
        }
    },
    {
        key: "sibilance-reduction",
        label: "Sibilance Reduction",
        tooltip: "Reduces sibilance sounds. Example: Softens harsh 's' sounds in speech.",
        settings: {
            speech: { sibilance: { reduction: { enable: true, amount: 'max' } } }
        }
    },
    {
        key: "click-reduction",
        label: "Click Reduction",
        tooltip: "Reduces clicking sounds. Example: Removes microphone clicks from a recording.",
        settings: {
            speech: { click: { reduction: { enable: true, amount: 'max' } } }
        }
    },
    {
        key: "plosive-reduction",
        label: "Plosive Reduction",
        tooltip: "Reduces plosive sounds. Example: Softens 'p' and 'b' sounds in speech.",
        settings: {
            speech: { plosive: { reduction: { enable: true, amount: 'max' } } }
        }
    },
    {
        key: "music-detection",
        label: "Music Detection",
        tooltip: "Detects and processes music. Example: Enhances music clarity in a concert recording.",
        settings: {
            music: { detection: { enable: true } }
        }
    }
];

export interface IFormInput {
    content_type?: IDolbyContenType;
}