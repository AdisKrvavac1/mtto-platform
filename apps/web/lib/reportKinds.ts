import type { FC, SVGProps } from 'react';
import { CloudRaining01, Droplets02, DotsHorizontal, LayersThree01, Scissors01, ThermometerWarm, Trash03, Wind01 } from '@untitledui/icons';

export const KINDS: [string, string, FC<SVGProps<SVGSVGElement> & { size?: number }>][] = [
  ['POZAR', 'Požar ili dim', ThermometerWarm], ['DEPONIJA', 'Divlja deponija', Trash03], ['VODA', 'Zagađenje vode', Droplets02],
  ['ZRAK', 'Zrak / neugodni mirisi', Wind01], ['KLIZISTE', 'Klizište / odron', LayersThree01], ['POPLAVA', 'Poplava / bujica', CloudRaining01],
  ['SJECA', 'Nelegalna sječa', Scissors01], ['OSTALO', 'Ostalo', DotsHorizontal],
];
