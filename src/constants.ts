import { Subject } from './types';

export const INITIAL_SUBJECTS: Subject[] = [
  { id: '1', name: '语文', icon: '📖', color: '#ffb3ba' },
  { id: '2', name: '数学', icon: '🔢', color: '#baffc9' },
  { id: '3', name: '英语', icon: '🌍', color: '#bae1ff' },
  { id: '4', name: '科学', icon: '🔬', color: '#ffffba' },
  { id: '5', name: '音乐', icon: '🎵', color: '#cc99ff' },
  { id: '6', name: '美术', icon: '🎨', color: '#ffdfba' },
];

export const TITLES = [
  { name: '小萌芽', minPoints: 0 },
  { name: '小树苗', minPoints: 100 },
  { name: '小绿植', minPoints: 300 },
  { name: '向阳花', minPoints: 600 },
  { name: '智慧果', minPoints: 1000 },
];
