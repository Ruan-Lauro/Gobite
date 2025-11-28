import { OrderStorage } from './order';
import { NotificationService } from './NotificationService';
import { Order } from '../types';

export class OrderTrackingService {
  private static timers: Map<string, NodeJS.Timeout> = new Map();

  static startOrderTracking(orderId: string) {
    this.stopOrderTracking(orderId);

    const timer = setTimeout(async () => {
      await this.markOrderReadyForDelivery(orderId);
    }, 60000);

    this.timers.set(orderId, timer);
    console.log(`Order tracking started for order ${orderId}`);
  }

  static stopOrderTracking(orderId: string) {
    const timer = this.timers.get(orderId);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(orderId);
      console.log(`Order tracking stopped for order ${orderId}`);
    }
  }

  static async markOrderReadyForDelivery(orderId: string) {
    try {
      const order = await OrderStorage.findOrderById(orderId);
      
      if (!order) {
        console.error('Order not found:', orderId);
        return;
      }

      await OrderStorage.updateOrderStatus(orderId, 'delivered');

      await NotificationService.sendNotification({
        type: 'order_ready',
        title: '🚀 Your Order is Ready!',
        body: `Your order #${orderId.slice(-6)} is now being prepared for delivery!`,
        data: { orderId },
        orderId,
      });

      setTimeout(async () => {
        await this.sendDeliveryNotification(orderId, order);
      }, 2000);

      this.stopOrderTracking(orderId);
    } catch (error) {
      console.error('Error marking order ready for delivery:', error);
    }
  }

  static async sendDeliveryNotification(orderId: string, order: Order) {
    try {
      await NotificationService.sendNotification({
        type: 'delivery',
        title: '🛵 Out for Delivery!',
        body: `Your order is on its way! Expected delivery in 20-30 minutes.`,
        data: { orderId },
        orderId,
      });

      console.log(`Delivery notification sent for order ${orderId}`);
    } catch (error) {
      console.error('Error sending delivery notification:', error);
    }
  }

  static async completeOrder(orderId: string) {
    try {
      await OrderStorage.updateOrderStatus(orderId, 'delivered');
      
      await NotificationService.sendNotification({
        type: 'general',
        title: '✅ Order Delivered!',
        body: `Your order has been successfully delivered. Enjoy your meal!`,
        data: { orderId },
        orderId,
      });

      console.log(`Order ${orderId} completed`);
    } catch (error) {
      console.error('Error completing order:', error);
    }
  }

  static getActiveTrackings(): string[] {
    return Array.from(this.timers.keys());
  }

  static clearAllTimers() {
    this.timers.forEach((timer) => clearTimeout(timer));
    this.timers.clear();
  }
}