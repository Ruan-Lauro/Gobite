export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
  password?: string;
  img?: string;
  chooseLocation?: Location;
  chooseCard?: SavedCard;
}

export interface Location {
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  complement: string;
  reference: string;
  idUser: string;
}

export interface SavedCard {
  id: string;
  number: string; 
  holder: string;
  brand: 'visa' | 'mastercard' | 'elo' | 'amex';
  isDefault: boolean;
  token?: string;
  idUser: string; 
}

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
  image?: string;
}

export interface Cart {
  items: CartItem[];
  total: number;
  subtotal: number;
  deliveryFee: number;
  discount?: number;
  appliedCoupon?: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  subtotal: number;
  deliveryFee: number;
  discount?: number;
  appliedCoupon?: string;
  address: Location;
  paymentMethod: 'card' | 'cash' | 'pix';
  cardId?: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';
  orderDate: string;
  estimatedDelivery?: string;
  notes?: string;
}

export interface UserSession {
  user: User;
  token?: string;
  loginDate: string;
  rememberUser: boolean;
}

export interface CategoryProduct {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  image: string;
  rating: number;
  reviewCount: number;
  deliveryTime: string;
  distance: string;
  discount?: number;
}

export interface Category {
  idCategory: string;
  strCategory: string;
  strCategoryThumb: string;
  strCategoryDescription: string;
}

export interface Meal {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
  strInstructions: string;
}

export interface MealSummary {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
}

export interface CategoriesResponse {
  categories: Category[];
}

export interface MealsResponse {
  meals: Meal[] | null;
}

export interface MealsSummaryResponse {
  meals: MealSummary[] | null;
}

export interface UseMealDBState {
  categories: Category[];
  meals: Meal[];
  mealsSummary: MealSummary[];
  loading: boolean;
  error: string | null;
}

export interface RecentSearch {
  id: string;
  term: string;
  userId: string;
  searchedAt: string;
}

export interface UserRecentSearches {
  userId: string;
  searches: RecentSearch[];
}

export interface FavoriteItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  image: string;
  rating: number;
  reviewCount: number;
  userId: string;
  favoritedAt: string;
}

export interface UserFavorites {
  userId: string;
  items: FavoriteItem[];
}