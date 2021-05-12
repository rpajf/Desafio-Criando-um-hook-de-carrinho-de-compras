import { createContext, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem('@RocketShoes:cart');

    if (storagedCart) {
      JSON.parse(storagedCart);
    }
    
    return [];
  });
  const addProduct = async (productId: number) => {

    try {
      const response = await api.post('/product', {productId})

      const { cart } = response.data
      setCart([...cart, productId])
      localStorage.setItem('@RocketShoes:cart', cart)

      
      
    } catch (e){
      toast.error(`${}`)
    }
  };

  const removeProduct = async (productId: number) => {
    try {
      await api.delete('/product', { params: productId })
      

    } catch (e){
      alert(`${e}`)
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      const cart = { productId, amount}
      await api.put('/product', { params: cart.productId , amount: cart.amount })
      

    } catch {
      // TODO
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
