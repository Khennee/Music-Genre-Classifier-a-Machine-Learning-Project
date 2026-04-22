export interface ClassificationResults {
    [genre: string]: number;
}

export interface AudioMetadata {
    fileName: string;
    duration: number;
    fileSize: number;
}