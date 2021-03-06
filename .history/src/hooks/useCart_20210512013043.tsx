import { createContext, ReactNode, useContext, useState, useRef } from 'react';
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
    const prevCartRef = useRef<Product[]>();

    useEffect(() => {
      prevCartRef.current = cart;
    })
    const prevCart = 
    
    return [];
  });
  const addProduct = async (productId: number) => {

    try {
      const cartUpdated = [...cart]

      const checkProduct = cartUpdated.find(product => product.id === productId)
      const stock = await api.get(`/stock/${productId} `);
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
        cartUpdated.push(returnedProduct)
      }
      

      setCart(cartUpdated)
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(cart))

      
      
    } catch (e){
      toast.error(`${e}`)
    }
  };

  const removeProduct = async (productId: number) => {
    try {
      const newCart = [...cart]
      
      
      const removed = newCart.findIndex(product => product.id === productId)

      if(removed > -1){
        newCart.splice(removed, 1);
        setCart(newCart)
      }else {
        throw Error()
      }
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(newCart))

      

    } catch (e){
      toast.error('Erro na remo????o do produto')
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
      const cartUpdated = [...cart]
      const productExists = cartUpdated.find(product => product.id === productId)
      if(productExists){
        productExists.amount = amount;

        setCart(cartUpdated);
        localStorage.setItem('@RocketShoes:cart', JSON.stringify(cartUpdated))

      }
      else{
        toast.error('Erro na altera????o da quantidade');
      }


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
