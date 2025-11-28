import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEYS } from "key";
import { Cart, CartItem } from "types";

export class CartStorage {
  
  static async saveCart(cart: Cart): Promise<void> {
    try {
      const updatedCart = {
        ...cart,
        updatedAt: new Date().toISOString(),
      };
      await AsyncStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(updatedCart));
    } catch (error) {
      throw new Error(`Error saving cart: ${error}`);
    }
  }

  static async getCart(): Promise<Cart> {
    try {
      const cart = await AsyncStorage.getItem(STORAGE_KEYS.CART);
      if (cart) {
        return JSON.parse(cart);
      }
      
      const emptyCart: Cart = {
        items: [],
        total: 0,
        subtotal: 0,
        deliveryFee: 0,
        updatedAt: new Date().toISOString(),
      };
      
      await this.saveCart(emptyCart);
      return emptyCart;
    } catch (error) {
      console.error('Error getting cart:', error);
      return {
        items: [],
        total: 0,
        subtotal: 0,
        deliveryFee: 0,
        updatedAt: new Date().toISOString(),
      };
    }
  }

  static async addItem(item: CartItem): Promise<void> {
    try {
      const cart = await this.getCart();
      const existingItem = cart.items.find(i => i.productId === item.productId);
      
      if (existingItem) {
        existingItem.quantity += item.quantity;
      } else {
        cart.items.push(item);
      }
      
      this.recalculateTotals(cart);
      await this.saveCart(cart);
    } catch (error) {
      throw new Error(`Error adding item to cart: ${error}`);
    }
  }

  // Remove item from cart
  static async removeItem(productId: string): Promise<void> {
    try {
      const cart = await this.getCart();
      cart.items = cart.items.filter(item => item.productId !== productId);
      
      this.recalculateTotals(cart);
      await this.saveCart(cart);
    } catch (error) {
      throw new Error(`Error removing item from cart: ${error}`);
    }
  }

  // Update item quantity
  static async updateQuantity(productId: string, newQuantity: number): Promise<void> {
    try {
      const cart = await this.getCart();
      const item = cart.items.find(i => i.productId === productId);
      
      if (item) {
        if (newQuantity <= 0) {
          await this.removeItem(productId);
        } else {
          item.quantity = newQuantity;
          this.recalculateTotals(cart);
          await this.saveCart(cart);
        }
      }
    } catch (error) {
      throw new Error(`Error updating quantity: ${error}`);
    }
  }

  // Clear cart
  static async clearCart(): Promise<void> {
    try {
      const emptyCart: Cart = {
        items: [],
        total: 0,
        subtotal: 0,
        deliveryFee: 0,
        updatedAt: new Date().toISOString(),
      };
      
      await this.saveCart(emptyCart);
    } catch (error) {
      throw new Error(`Error clearing cart: ${error}`);
    }
  }

  // Apply discount coupon
  static async applyCoupon(coupon: string, discountValue: number): Promise<void> {
    try {
      const cart = await this.getCart();
      cart.appliedCoupon = coupon;
      cart.discount = discountValue;
      
      this.recalculateTotals(cart);
      await this.saveCart(cart);
    } catch (error) {
      throw new Error(`Error applying coupon: ${error}`);
    }
  }

  // Calculate cart totals
  private static recalculateTotals(cart: Cart): void {
    cart.subtotal = cart.items.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
    
    const discount = cart.discount || 0;
    cart.total = cart.subtotal + cart.deliveryFee - discount;
  }
}