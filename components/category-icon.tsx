import { ShoppingCart, Home, Car, Coffee, Utensils, Heart, Plane, GraduationCap, Gamepad2, Shirt, Wrench, Smartphone, Gift, DollarSign } from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  ShoppingCart,
  Home,
  Car,
  Coffee,
  Utensils,
  Heart,
  Plane,
  GraduationCap,
  Gamepad2,
  Shirt,
  Wrench,
  Smartphone,
  Gift,
  DollarSign,
};

type Props = {
  iconName?: string | null;
  className?: string;
};

export function CategoryIcon({ iconName, className = "h-4 w-4" }: Props) {
  const Icon = iconName && iconMap[iconName] ? iconMap[iconName] : ShoppingCart;
  return <Icon className={className} />;
}
