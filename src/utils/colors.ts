import { Element } from '../data/mockData';

export const getElementColorClass = (element: Element): string => {
  switch (element) {
    case 'kim':
      return 'text-slate-500'; // Gray/Gold
    case 'moc':
      return 'text-green-600'; // Green
    case 'thuy':
      return 'text-black'; // Black/Dark Blue
    case 'hoa':
      return 'text-red-600'; // Red
    case 'tho':
      return 'text-amber-600'; // Brown/Yellow
    default:
      return 'text-gray-800';
  }
};
