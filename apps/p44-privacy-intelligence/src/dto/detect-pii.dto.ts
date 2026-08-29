export class DetectPiiDto {
  text: string;
}

export class PiiEntityDto {
  type: string;
  value: string;
  startIndex: number;
  endIndex: number;
}
