/* eslint-disable @typescript-eslint/naming-convention */
import { VariantType } from 'notistack';

export type NOTIFICATION_TYPE = (variant: VariantType, message: string, signature?: string, network?: string) => void;
