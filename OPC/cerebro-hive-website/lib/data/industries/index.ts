import { healthcare } from "./healthcare";
import { finance } from "./finance";
import { manufacturing } from "./manufacturing";
import { retail } from "./retail";
import { government } from "./government";
import { insurance } from "./insurance";
import { energy } from "./energy";
import { construction } from "./construction";
import { realEstate } from "./real-estate";
import { logistics } from "./logistics";
import { education } from "./education";
import { telecom } from "./telecom";
import { technology } from "./technology";
import { media } from "./media";
import { services } from "./services";

export const industriesData = [
  finance,
  manufacturing,
  healthcare,
  retail,
  government,
  insurance,
  energy,
  construction,
  realEstate,
  logistics,
  education,
  telecom,
  technology,
  media,
  services
];

export const getIndustryBySlug = (slug: string) => {
  return industriesData.find((ind) => ind.slug === slug);
};
