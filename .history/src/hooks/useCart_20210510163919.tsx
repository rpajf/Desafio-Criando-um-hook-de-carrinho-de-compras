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
      const cartUpdated = [...cart]

      const checkProduct = cartUpdated.find(product => product.id === productId)
      const stock = await api.get(`/stock/${productId} `);
      const stockAmount = stock.data.amount
      // const newStock = stockAmount
      const currentAmount = checkProduct ? checkProduct.amount : 0
      const amount = currentAmount + 1

      if(amount > stockAmount){
        toast.error('Quantidade solicitada fora de estoque');
        return
      }
      if(checkProduct){
        checkProduct.amount = amount;
      } else {
        const product = await api.get(`products/${productId}`)
        const returnedProduct = {...product.data, amount: 1}
        cartUpdated.push(returnedProduct)
      }
      

      setCart())
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(cart))

      
      
    } catch (e){
      toast.error(`${e}`)
    }
  };

  const removeProduct = async (productId: number) => {
    try {
      const newCart = {...cart}
      newCart.filter(newCart => newCart.id === productId)
      await api.delete('/product', { params: newCart })
      

    } catch (e){
      toast.error(`${e}`)
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      const cart = { productId, amount}
      await api.put('/product', { params: cart.productId , amount: cart.amount })
      

    } catch(e) {
      toast.error(`${e}`)
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
