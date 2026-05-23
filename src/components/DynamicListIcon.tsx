import React from 'react';
import { Layers, Briefcase, User, DollarSign, Activity, Folder } from 'lucide-react';

interface Props {
  name: string;
  className?: string;
}

export default function DynamicListIcon({ name, className }: Props) {
  switch (name) {
    case 'Layers':
      return <Layers className={className} />;
    case 'Briefcase':
      return <Briefcase className={className} />;
    case 'User':
      return <User className={className} />;
    case 'DollarSign':
      return <DollarSign className={className} />;
    case 'Activity':
      return <Activity className={className} />;
    default:
      return <Folder className={className} />;
  }
}
