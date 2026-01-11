import React from 'react';
import { renderHook, act, cleanup } from '@testing-library/react';
import { CartProvider, useCart } from '../state/CartContext';
import { faker } from '@faker-js/faker';

// ... остальной код без изменений

// npm i jest
// npm i faker
// npx jest --clearCache

//faker.setLocale('ru');

const createMockProduct = (overrides = {}) => ({
  id: faker.datatype.uuid(),
  name: faker.commerce.productName(),
  price: faker.commerce.price(1000, 10000, 0, '₽'),
  size: faker.helpers.arrayElement(['XS', 'S', 'M', 'L', 'XL']),
  image: faker.image.fashion(),
  quantity: 1,
  ...overrides
});

const renderCartHook = () => {
  const wrapper = ({ children }) => React.createElement(CartProvider, null, children);
  return renderHook(() => useCart(), { wrapper });
};

describe('CartContext', () => {
  beforeEach(() => {
    // Очищаем localStorage перед каждым тестом
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('addToCart function', () => {
    test('ПОЗИТИВНЫЙ: должен добавить товар в пустую корзину', () => {
      const { result } = renderCartHook();
      const mockProduct = createMockProduct();

      act(() => {
        result.current.addToCart(mockProduct);
      });

      expect(result.current.cart).toHaveLength(1);
      expect(result.current.cart[0]).toMatchObject({
        ...mockProduct,
        quantity: 1
      });
    });

    test('ПОЗИТИВНЫЙ: должен добавить несколько разных товаров', () => {
      const { result } = renderCartHook();
      const products = [
        createMockProduct({ id: '1' }),
        createMockProduct({ id: '2' })
      ];

      act(() => {
        products.forEach(product => result.current.addToCart(product));
      });

      expect(result.current.cart).toHaveLength(2);
      expect(result.current.cart[0].id).toBe('1');
      expect(result.current.cart[1].id).toBe('2');
    });

    test('ПОЗИТИВНЫЙ: должен добавить товары с одинаковым ID но разными размерами', () => {
      const { result } = renderCartHook();
      const baseProduct = createMockProduct({ id: 'same-id' });

      act(() => {
        result.current.addToCart({ ...baseProduct, size: 'S' });
        result.current.addToCart({ ...baseProduct, size: 'M' });
      });

      expect(result.current.cart).toHaveLength(2);
      expect(result.current.cart[0].size).toBe('S');
      expect(result.current.cart[1].size).toBe('M');
    });

    test('НЕГАТИВНЫЙ: не должен добавлять товар без обязательных полей', () => {
      const { result } = renderCartHook();
      const invalidProducts = [
        { name: 'Товар без ID' }, // Нет ID
        { id: '123' }, // Нет имени и цены
        null, // null значение
        undefined // undefined значение
      ];

      invalidProducts.forEach(invalidProduct => {
        expect(() => {
          act(() => {
            result.current.addToCart(invalidProduct);
          });
        }).not.toThrow();
      });
    });
  });

  describe('removeFromCart function', () => {
    test('ПОЗИТИВНЫЙ: должен удалить товар по корректному индексу', () => {
      const { result } = renderCartHook();
      const products = [
        createMockProduct({ id: '1' }),
        createMockProduct({ id: '2' }),
        createMockProduct({ id: '3' })
      ];

      act(() => {
        products.forEach(product => result.current.addToCart(product));
      });

      // Удаляем второй товар (индекс 1)
      act(() => {
        result.current.removeFromCart(1);
      });

      expect(result.current.cart).toHaveLength(2);
      expect(result.current.cart[0].id).toBe('1');
      expect(result.current.cart[1].id).toBe('3');
    });

    test('ПОЗИТИВНЫЙ: должен удалить первый товар', () => {
      const { result } = renderCartHook();
      const product = createMockProduct();

      act(() => {
        result.current.addToCart(product);
        result.current.removeFromCart(0);
      });

      expect(result.current.cart).toHaveLength(0);
    });

    test('ПОЗИТИВНЫЙ: должен удалить последний товар', () => {
      const { result } = renderCartHook();
      const products = [
        createMockProduct({ id: '1' }),
        createMockProduct({ id: '2' }),
        createMockProduct({ id: '3' })
      ];

      act(() => {
        products.forEach(product => result.current.addToCart(product));
        result.current.removeFromCart(2); // Удаляем последний
      });

      expect(result.current.cart).toHaveLength(2);
      expect(result.current.cart[1].id).toBe('2'); // Теперь последний с id '2'
    });

    test('НЕГАТИВНЫЙ: не должен ломаться при удалении с несуществующим индексом', () => {
      const { result } = renderCartHook();
      const product = createMockProduct();

      act(() => {
        result.current.addToCart(product);
      });

      const originalCart = [...result.current.cart];

      // Пытаемся удалить с несуществующими индексами
      const invalidIndices = [-1, 10, 999, NaN];

      invalidIndices.forEach(index => {
        act(() => {
          result.current.removeFromCart(index);
        });
        
        // Корзина должна остаться неизменной
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
      const products = Array.from({ length: 5 }, () => createMockProduct());

      act(() => {
        products.forEach(product => result.current.addToCart(product));
      });

      expect(result.current.cart).toHaveLength(5);

      act(() => {
        result.current.clearCart();
      });

      expect(result.current.cart).toHaveLength(0);
      expect(result.current.cart).toEqual([]);
    });

    test('ПОЗИТИВНЫЙ: должен очистить корзину с одним товаром', () => {
      const { result } = renderCartHook();
      const product = createMockProduct();

      act(() => {
        result.current.addToCart(product);
        result.current.clearCart();
      });

      expect(result.current.cart).toHaveLength(0);
    });

    test('ПОЗИТИВНЫЙ: должен корректно очистить уже пустую корзину', () => {
      const { result } = renderCartHook();

      act(() => {
        result.current.clearCart();
      });

      expect(result.current.cart).toHaveLength(0);
    });
  });

  describe('localStorage integration', () => {
    test('ПОЗИТИВНЫЙ: должен сохранять корзину в localStorage', () => {
      const { result } = renderCartHook();
      const products = [
        createMockProduct({ id: '1', name: 'Товар 1' }),
        createMockProduct({ id: '2', name: 'Товар 2' })
      ];

      act(() => {
        products.forEach(product => result.current.addToCart(product));
      });

      const savedCart = JSON.parse(localStorage.getItem('post_riot_cart'));
      expect(savedCart).toHaveLength(2);
      expect(savedCart[0].name).toBe('Товар 1');
      expect(savedCart[1].name).toBe('Товар 2');
    });

    test('ПОЗИТИВНЫЙ: должен загружать корзину из localStorage при инициализации', () => {
      const mockCart = [
        createMockProduct({ id: 'saved-1', name: 'Сохраненный товар 1' }),
        createMockProduct({ id: 'saved-2', name: 'Сохраненный товар 2' })
      ];
      
      localStorage.setItem('post_riot_cart', JSON.stringify(mockCart));

      const { result } = renderCartHook();

      expect(result.current.cart).toHaveLength(2);
      expect(result.current.cart[0].id).toBe('saved-1');
      expect(result.current.cart[1].id).toBe('saved-2');
    });

    test('ПОЗИТИВНЫЙ: должен использовать пустой массив при некорректных данных в localStorage', () => {
      // Некорректные данные в localStorage
      localStorage.setItem('post_riot_cart', 'невалидный JSON');

      const { result } = renderCartHook();

      expect(result.current.cart).toEqual([]);
      expect(result.current.cart).toHaveLength(0);
    });

    test('ПОЗИТИВНЫЙ: должен использовать пустой массив если localStorage пустой', () => {
      localStorage.removeItem('post_riot_cart');

      const { result } = renderCartHook();

      expect(result.current.cart).toEqual([]);
    });
  });

  describe('cart state persistence', () => {
    test('ПОЗИТИВНЫЙ: должен поддерживать состояние при последовательных операциях', () => {
      const { result } = renderCartHook();
      const products = [
        createMockProduct({ id: '1', price: '1000₽' }),
        createMockProduct({ id: '2', price: '2000₽' }),
        createMockProduct({ id: '3', price: '3000₽' })
      ];

      // Добавляем 3 товара
      act(() => {
        products.forEach(product => result.current.addToCart(product));
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
        result.current.addToCart(createMockProduct({ id: '4' }));
      });
      expect(result.current.cart).toHaveLength(3);

      // Очищаем
      act(() => {
        result.current.clearCart();
      });
      expect(result.current.cart).toHaveLength(0);
    });

    test('НЕГАТИВНЫЙ: должен обрабатывать edge cases при работе с индексами', () => {
      const { result } = renderCartHook();
      const product = createMockProduct();

      act(() => {
        result.current.addToCart(product);
      });

      // Проверяем различные edge cases
      const testCases = [
        { index: 0.5, shouldRemove: false }, // дробный индекс
        { index: '0', shouldRemove: true },  // строка '0' (преобразуется в число)
        { index: null, shouldRemove: false },
        { index: undefined, shouldRemove: false },
        { index: {}, shouldRemove: false }
      ];

      testCases.forEach(({ index, shouldRemove }) => {
        const cartBefore = [...result.current.cart];
        
        act(() => {
          result.current.removeFromCart(index);
        });

        if (shouldRemove) {
          expect(result.current.cart).toHaveLength(0);
          // Восстанавливаем товар для следующего теста
          act(() => {
            result.current.addToCart(product);
          });
        } else {
          expect(result.current.cart).toEqual(cartBefore);
        }
      });
    });
  });
});