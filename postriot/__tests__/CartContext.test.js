import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { CartProvider, useCart } from '../state/CartContext'; // Изменен путь импорта
import { faker } from '@faker-js/faker';
import { products } from '../products'; // Импортируем существующие товары

const generateProduct = (overrides = {}) => {
  // Используем реальный продукт из существующего списка как базовый шаблон
  const baseProduct = faker.helpers.arrayElement(products);
  
  return {
    id: faker.string.uuid(), // Обновленный метод для faker v8+
    name: faker.commerce.productName(),
    price: faker.commerce.price({ min: 1000, max: 10000, symbol: '₽' }),
    size: faker.helpers.arrayElement(['XS', 'S', 'M', 'L', 'XL']),
    image: faker.image.url(),
    quantity: 1,
    ...overrides
  };
};

// Создаем продукты на основе существующих товаров из products.js
const createProductFromExisting = (existingProduct, overrides = {}) => {
  const sizeList = existingProduct.sizeList || ['XS', 'S', 'M', 'L', 'XL'];
  
  return {
    id: existingProduct.id,
    name: existingProduct.name,
    price: existingProduct.price,
    size: faker.helpers.arrayElement(sizeList),
    image: existingProduct.image,
    quantity: 1,
    ...overrides
  };
};

const renderCartHook = () => {
  const wrapper = ({ children }) => React.createElement(CartProvider, null, children);
  return renderHook(() => useCart(), { wrapper });
};

describe('CartContext', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('addToCart function', () => {
    test('ПОЗИТИВНЫЙ: должен добавить товар в пустую корзину', () => {
      const { result } = renderCartHook();
      const mockProduct = generateProduct();

      act(() => {
        result.current.addToCart(mockProduct);
      });

      expect(result.current.cart).toHaveLength(1);
      expect(result.current.cart[0]).toMatchObject({
        ...mockProduct,
        quantity: 1
      });
    });

    test('ПОЗИТИВНЫЙ: должен добавить существующий товар из products.js', () => {
      const { result } = renderCartHook();
      const existingProduct = products[0]; // Берем первый существующий товар
      const mockProduct = createProductFromExisting(existingProduct);

      act(() => {
        result.current.addToCart(mockProduct);
      });

      expect(result.current.cart).toHaveLength(1);
      expect(result.current.cart[0].name).toBe(existingProduct.name);
      expect(result.current.cart[0].price).toBe(existingProduct.price);
    });

    test('ПОЗИТИВНЫЙ: должен добавить несколько разных товаров', () => {
      const { result } = renderCartHook();
      const productsToAdd = [
        createProductFromExisting(products[0], { id: '1', size: 'M' }),
        createProductFromExisting(products[1], { id: '2', size: 'L' })
      ];

      act(() => {
        productsToAdd.forEach(product => result.current.addToCart(product));
      });

      expect(result.current.cart).toHaveLength(2);
      expect(result.current.cart[0].id).toBe('1');
      expect(result.current.cart[1].id).toBe('2');
    });

    test('ПОЗИТИВНЫЙ: должен добавить товары с одинаковым ID но разными размерами', () => {
      const { result } = renderCartHook();
      const baseProduct = createProductFromExisting(products[0], { id: 'same-id' });

      act(() => {
        result.current.addToCart({ ...baseProduct, size: 'S' });
        result.current.addToCart({ ...baseProduct, size: 'M' });
      });

      expect(result.current.cart).toHaveLength(2);
      expect(result.current.cart[0].size).toBe('S');
      expect(result.current.cart[1].size).toBe('M');
      expect(result.current.cart[0].id).toBe('same-id');
      expect(result.current.cart[1].id).toBe('same-id');
    });

    test('НЕГАТИВНЫЙ: не должен добавлять товар без обязательных полей', () => {
      const { result } = renderCartHook();
      const invalidProducts = [
        { name: 'Товар без ID' },
        { id: '123' },
        null,
        undefined
      ];

      invalidProducts.forEach(invalidProduct => {
        const cartBefore = [...result.current.cart];
        
        act(() => {
          result.current.addToCart(invalidProduct);
        });

        // Корзина не должна измениться
        expect(result.current.cart).toEqual(cartBefore);
      });
    });

    test('ПОЗИТИВНЫЙ: должен корректно добавлять товар с существующими размерами из sizeList', () => {
      const { result } = renderCartHook();
      const existingProduct = products[0]; // Худи Post Riot
      const validSize = 'M'; // Размер из sizeList продукта
      
      const mockProduct = {
        ...createProductFromExisting(existingProduct),
        size: validSize
      };

      act(() => {
        result.current.addToCart(mockProduct);
      });

      expect(result.current.cart).toHaveLength(1);
      expect(result.current.cart[0].size).toBe(validSize);
    });
  });

  describe('removeFromCart function', () => {
    test('ПОЗИТИВНЫЙ: должен удалить товар по корректному индексу', () => {
      const { result } = renderCartHook();
      const mockProducts = [
        createProductFromExisting(products[0], { id: 'prod-1' }),
        createProductFromExisting(products[1], { id: 'prod-2' }),
        createProductFromExisting(products[2], { id: 'prod-3' })
      ];

      act(() => {
        mockProducts.forEach(product => result.current.addToCart(product));
      });

      // Удаляем второй товар (индекс 1)
      act(() => {
        result.current.removeFromCart(1);
      });

      expect(result.current.cart).toHaveLength(2);
      expect(result.current.cart[0].id).toBe('prod-1');
      expect(result.current.cart[1].id).toBe('prod-3');
    });

    test('НЕГАТИВНЫЙ: не должен ломаться при удалении с несуществующим индексом', () => {
      const { result } = renderCartHook();
      const mockProduct = createProductFromExisting(products[0]);

      act(() => {
        result.current.addToCart(mockProduct);
      });

      const originalCart = [...result.current.cart];

      const invalidIndices = [-1, 10, 999, NaN];

      invalidIndices.forEach(index => {
        act(() => {
          result.current.removeFromCart(index);
        });
        
        expect(result.current.cart).toEqual(originalCart);
      });
    });

    test('НЕГАТИВНЫЙ: не должен ломаться при удалении из пустой корзины', () => {
      const { result } = renderCartHook();

      expect(() => {
        act(() => {
          result.current.removeFromCart(0);
        });
      }).not.toThrow();

      expect(result.current.cart).toHaveLength(0);
    });
  });

  describe('clearCart function', () => {
    test('ПОЗИТИВНЫЙ: должен полностью очистить корзину с товарами', () => {
      const { result } = renderCartHook();
      const mockProducts = Array.from({ length: 3 }, (_, i) => 
        createProductFromExisting(products[i % products.length])
      );

      act(() => {
        mockProducts.forEach(product => result.current.addToCart(product));
      });

      expect(result.current.cart).toHaveLength(3);

      act(() => {
        result.current.clearCart();
      });

      expect(result.current.cart).toHaveLength(0);
    });
  });

  describe('localStorage integration', () => {
    test('ПОЗИТИВНЫЙ: должен сохранять корзину в localStorage', () => {
      const { result } = renderCartHook();
      const mockProducts = [
        createProductFromExisting(products[0], { name: 'Худи Post Riot' }),
        createProductFromExisting(products[1], { name: 'Футболка MUDROST' })
      ];

      act(() => {
        mockProducts.forEach(product => result.current.addToCart(product));
      });

      const savedCart = JSON.parse(localStorage.getItem('post_riot_cart'));
      expect(savedCart).toHaveLength(2);
      expect(savedCart[0].name).toBe('Худи Post Riot');
      expect(savedCart[1].name).toBe('Футболка MUDROST');
    });

    test('ПОЗИТИВНЫЙ: должен загружать корзину из localStorage при инициализации', () => {
      const mockCart = [
        createProductFromExisting(products[0], { id: 'saved-1', name: 'Сохраненный товар 1' }),
        createProductFromExisting(products[1], { id: 'saved-2', name: 'Сохраненный товар 2' })
      ];
      
      localStorage.setItem('post_riot_cart', JSON.stringify(mockCart));

      const { result } = renderCartHook();

      expect(result.current.cart).toHaveLength(2);
      expect(result.current.cart[0].id).toBe('saved-1');
      expect(result.current.cart[1].id).toBe('saved-2');
    });

    test('ПОЗИТИВНЫЙ: должен использовать пустой массив при некорректных данных в localStorage', () => {
      localStorage.setItem('post_riot_cart', 'невалидный JSON');

      const { result } = renderCartHook();

      expect(result.current.cart).toEqual([]);
    });
  });

  describe('cart state persistence', () => {
    test('ПОЗИТИВНЫЙ: должен поддерживать состояние при последовательных операциях', () => {
      const { result } = renderCartHook();
      const mockProducts = [
        createProductFromExisting(products[0], { id: '1' }),
        createProductFromExisting(products[1], { id: '2' }),
        createProductFromExisting(products[2], { id: '3' })
      ];

      // Добавляем 3 товара
      act(() => {
        mockProducts.forEach(product => result.current.addToCart(product));
      });
      expect(result.current.cart).toHaveLength(3);

      // Удаляем второй
      act(() => {
        result.current.removeFromCart(1);
      });
      expect(result.current.cart).toHaveLength(2);
      expect(result.current.cart.map(p => p.id)).toEqual(['1', '3']);

      // Добавляем еще один
      act(() => {
        result.current.addToCart(createProductFromExisting(products[3], { id: '4' }));
      });
      expect(result.current.cart).toHaveLength(3);

      // Очищаем
      act(() => {
        result.current.clearCart();
      });
      expect(result.current.cart).toHaveLength(0);
    });
  });
});
