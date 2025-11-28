import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../key';
import { Coupon } from './NotificationService';
import { NotificationService } from './NotificationService';

export class CouponService {
  private static readonly AVAILABLE_COUPONS: Omit<Coupon, 'id' | 'isUsed'>[] = [
    {
      code: 'WELCOME5',
      discount: 5,
      description: 'Get 5% OFF on your order!',
      expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      minOrderValue: 0,
    },
    {
      code: 'SAVE10',
      discount: 10,
      description: 'Save 10% on orders above $20!',
      expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      minOrderValue: 20,
    },
    {
      code: 'MEGA15',
      discount: 15,
      description: 'Mega Deal! 15% OFF on orders above $30!',
      expiryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      minOrderValue: 30,
    },
    {
      code: 'SUPER20',
      discount: 20,
      description: 'Super Savings! 20% OFF on orders above $50!',
      expiryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      minOrderValue: 50,
    },
    {
      code: 'ULTRA25',
      discount: 25,
      description: 'Ultra Deal! 25% OFF on orders above $70!',
      expiryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      minOrderValue: 70,
    },
  ];

  private static readonly MAX_COUPONS_PER_TYPE = 5;

  static async initialize() {
    const existing = await this.getAllCouponDistributions();
    if (existing.length === 0) {
      const distributions = this.AVAILABLE_COUPONS.map(coupon => ({
        code: coupon.code,
        distributed: 0,
        maxDistribution: this.MAX_COUPONS_PER_TYPE,
      }));
      await AsyncStorage.setItem(
        STORAGE_KEYS.COUPON_DISTRIBUTIONS,
        JSON.stringify(distributions)
      );
    }
  }

  static async getAllCouponDistributions() {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.COUPON_DISTRIBUTIONS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting coupon distributions:', error);
      return [];
    }
  }

  static async isCouponAvailable(couponCode: string): Promise<boolean> {
    const distributions = await this.getAllCouponDistributions();
    const distribution = distributions.find((d: any) => d.code === couponCode);
    
    if (!distribution) return false;
    return distribution.distributed < distribution.maxDistribution;
  }

  static async distributeRandomCoupon(userId: string): Promise<Coupon | null> {
    try {
      const distributions = await this.getAllCouponDistributions();
      const availableCoupons = this.AVAILABLE_COUPONS.filter((coupon) => {
        const dist = distributions.find((d: any) => d.code === coupon.code);
        return dist && dist.distributed < dist.maxDistribution;
      });

      if (availableCoupons.length === 0) {
        console.log('No coupons available');
        return null;
      }

      const randomCoupon = availableCoupons[
        Math.floor(Math.random() * availableCoupons.length)
      ];

      const newCoupon: Coupon = {
        ...randomCoupon,
        id: `${userId}_${Date.now()}`,
        isUsed: false,
      };

      await this.saveCouponToUser(userId, newCoupon);
      await this.incrementDistribution(randomCoupon.code);

      await NotificationService.sendNotification({
        type: 'coupon',
        title: '🎉 New Coupon Available!',
        body: `Use code ${newCoupon.code} to get ${newCoupon.discount}% OFF!`,
        data: { couponId: newCoupon.id },
        coupon: newCoupon,
      });

      return newCoupon;
    } catch (error) {
      console.error('Error distributing coupon:', error);
      return null;
    }
  }

  static async saveCouponToUser(userId: string, coupon: Coupon) {
    try {
      const userCoupons = await this.getUserCoupons(userId);
      const updated = [...userCoupons, coupon];
      await AsyncStorage.setItem(
        `${STORAGE_KEYS.USER_COUPONS}_${userId}`,
        JSON.stringify(updated)
      );
    } catch (error) {
      console.error('Error saving coupon to user:', error);
    }
  }

  static async getUserCoupons(userId: string): Promise<Coupon[]> {
    try {
      const data = await AsyncStorage.getItem(`${STORAGE_KEYS.USER_COUPONS}_${userId}`);
      const coupons: Coupon[] = data ? JSON.parse(data) : [];
      
      const validCoupons = coupons.filter(
        coupon => new Date(coupon.expiryDate) > new Date()
      );
      
      if (validCoupons.length !== coupons.length) {
        await AsyncStorage.setItem(
          `${STORAGE_KEYS.USER_COUPONS}_${userId}`,
          JSON.stringify(validCoupons)
        );
      }
      
      return validCoupons;
    } catch (error) {
      console.error('Error getting user coupons:', error);
      return [];
    }
  }

  static async incrementDistribution(couponCode: string) {
    try {
      const distributions = await this.getAllCouponDistributions();
      const updated = distributions.map((d: any) =>
        d.code === couponCode ? { ...d, distributed: d.distributed + 1 } : d
      );
      await AsyncStorage.setItem(
        STORAGE_KEYS.COUPON_DISTRIBUTIONS,
        JSON.stringify(updated)
      );
    } catch (error) {
      console.error('Error incrementing distribution:', error);
    }
  }

  static async applyCoupon(
    userId: string,
    couponCode: string,
    orderTotal: number
  ): Promise<{ success: boolean; discount: number; message: string }> {
    try {
      const userCoupons = await this.getUserCoupons(userId);
      const coupon = userCoupons.find(c => c.code === couponCode && !c.isUsed);

      if (!coupon) {
        return { success: false, discount: 0, message: 'Invalid or already used coupon' };
      }

      if (new Date(coupon.expiryDate) < new Date()) {
        return { success: false, discount: 0, message: 'Coupon has expired' };
      }

      if (coupon.minOrderValue && orderTotal < coupon.minOrderValue) {
        return {
          success: false,
          discount: 0,
          message: `Minimum order value is $${coupon.minOrderValue}`,
        };
      }

      const discountAmount = (orderTotal * coupon.discount) / 100;

      await this.markCouponAsUsed(userId, coupon.id);

      return {
        success: true,
        discount: discountAmount,
        message: `${coupon.discount}% discount applied!`,
      };
    } catch (error) {
      console.error('Error applying coupon:', error);
      return { success: false, discount: 0, message: 'Error applying coupon' };
    }
  }

  static async markCouponAsUsed(userId: string, couponId: string) {
    try {
      const userCoupons = await this.getUserCoupons(userId);
      const updated = userCoupons.map(c =>
        c.id === couponId ? { ...c, isUsed: true } : c
      );
      await AsyncStorage.setItem(
        `${STORAGE_KEYS.USER_COUPONS}_${userId}`,
        JSON.stringify(updated)
      );
    } catch (error) {
      console.error('Error marking coupon as used:', error);
    }
  }

  static async getCouponStats() {
    const distributions = await this.getAllCouponDistributions();
    return distributions.map((d: any) => ({
      code: d.code,
      distributed: d.distributed,
      remaining: d.maxDistribution - d.distributed,
      maxDistribution: d.maxDistribution,
    }));
  }
}