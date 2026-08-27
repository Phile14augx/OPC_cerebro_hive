export class AnonymizeDto {
  data: any;
  strategy: 'k-anonymity' | 'l-diversity' | 'tokenization';
}

export class AnonymizeResponseDto {
  anonymized_data: any;
}
