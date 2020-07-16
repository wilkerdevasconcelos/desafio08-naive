import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Product): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const loadedProducts = await AsyncStorage.getItem(
        '@GoMarketplace:products',
      );
      if (loadedProducts) {
        setProducts([...JSON.parse(loadedProducts)]);
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      const exists = products.findIndex(p => p.id === product.id);

      if (exists === -1) {
        setProducts([...products, { ...product, quantity: 1 }]);

        await AsyncStorage.setItem(
          '@GoMarketplace:products',
          JSON.stringify([...products, { ...product, quantity: 1 }]),
        );
      } else {
        products[exists].quantity += 1;

        setProducts([...products]);

        await AsyncStorage.setItem(
          '@GoMarketplace:products',
          JSON.stringify([...products]),
        );
      }
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const exists = products.findIndex(product => product.id === id);

      if (exists !== -1) {
        products[exists].quantity += 1;

        setProducts([...products]);
      }

      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify([...products]),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const exists = products.findIndex(product => product.id === id);

      if (exists !== -1) {
        if (products[exists].quantity !== 1) {
          products[exists].quantity -= 1;

          setProducts([...products]);
        }
      }
      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify([...products]),
      );
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
