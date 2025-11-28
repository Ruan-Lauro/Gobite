import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEYS } from "key";
import { Order } from "types";

export class OrderStorage {
  
  static async saveOrder(order: Order): Promise<Order> {
    try {
      const existingOrders = await this.getAllOrders();
      
      const updatedOrders = [...existingOrders, order];
      await AsyncStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(updatedOrders));
      
      console.log('✅ Order saved:', order.id);
      return order;
    } catch (error) {
      throw new Error(`Error saving order: ${error}`);
    }
  }

  static async getAllOrders(): Promise<Order[]> {
    try {
      const orders = await AsyncStorage.getItem(STORAGE_KEYS.ORDERS);
      return orders ? JSON.parse(orders) : [];
    } catch (error) {
      console.error('Error getting orders:', error);
      return [];
    }
  }

  static async getUserOrders(userId: string): Promise<Order[]> {
    try {
      const allOrders = await this.getAllOrders();
      return allOrders
        .filter(order => order.userId === userId)
        .sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
    } catch (error) {
      console.error('Error getting user orders:', error);
      return [];
    }
  }

  static async findOrderById(orderId: string): Promise<Order | null> {
    try {
      const orders = await this.getAllOrders();
      return orders.find(o => o.id === orderId) || null;
    } catch (error) {
      console.error('Error finding order:', error);
      return null;
    }
  }

  static async updateOrderStatus(orderId: string, newStatus: Order['status']): Promise<void> {
    try {
      const orders = await this.getAllOrders();
      const index = orders.findIndex(o => o.id === orderId);
      
      if (index !== -1) {
        orders[index].status = newStatus;
        await AsyncStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
        console.log(`✅ Order ${orderId} status updated to: ${newStatus}`);
      } else {
        console.error(`❌ Order ${orderId} not found`);
      }
    } catch (error) {
      throw new Error(`Error updating order status: ${error}`);
    }
  }
}