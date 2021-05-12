import { createContext, ReactNode, useContext, useState, useRef, useEffect } from 'react';
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
  // const prevCartRef = useRef<Product[]>();

  // useEffect(() => {
  //   prevCartRef.current = cart;
  // })
  // const prevCartValue = prevCartRef.current ?? cart;

  // useEffect(() => {
  //   if(prevCartValue !== cart){
  //     localStorage.setItem('@RocketShoes:cart', JSON.stringify(cart))

  //   }

  // },[cart, prevCartValue])
  const addProduct = async (productId: number) => {

    try {
      const updatedCart = [...cart]

      const checkProduct = updatedCart.find(product => product.id === productId)
      const stock = await api.get(`/stock/${productId}`);
      const stockAmount = stock.data.amount

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
        // updatedCart.push(returnedProduct)
        updatedCart.map(cart => [...cart, re])
      }
      
      setCart(updatedCart)
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(updatedCart))

      
    } catch {
      toast.error('Quantidade solicitada fora de estoque');
    }
  };

  const removeProduct = async (productId: number) => {
    try {
      const newCart = [...cart]
      
      
      const removedIndex = newCart.findIndex(product => product.id === productId)

      if(removedIndex >0){
        newCart.splice(removedIndex, 1);
        setCart(newCart)
        localStorage.setItem('@RocketShoes:cart', JSON.stringify(cart))

      }else {
        throw Error()
      }

      

    } catch {
      toast.error('Erro na remoção do produto')
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      if(amount <= 0)
        return;
      const stock = await api.get(`/stock/${productId} `);
      const stockAmount = stock.data.amount

      if(amount > stockAmount){
        toast.error('Quantidade solicitada fora de estoque');
        return

      }
      if(amount < 1){
        toast.error('Erro na remoção de produto')
        return
      }
      const cartUpdated = [...cart]
      const productExists = cartUpdated.find(product => product.id === productId)
      if(productExists){
        productExists.amount = amount;

        setCart(cartUpdated);
      }
      else{
        throw Error()
      }


    } catch {
      toast.error('Erro na alteração da quantidade');
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
