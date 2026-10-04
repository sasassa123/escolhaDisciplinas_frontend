import { useEffect, useState } from 'react';
import Card from '../components/common/Card';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { fetchProducts } from '../services/api';
import '../styles/Products.css';

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

export default function Products() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    let ignore = false;

    fetchProducts()
      .then((data) => {
        if (!ignore) setProducts(data);
      })
      .catch((error) => {
        if (ignore) return;
        console.error('Erro ao buscar os produtos:', error);
        setErrorMessage('Não foi possível carregar os produtos. Verifique se a API está rodando e tente novamente.');
      })
      .finally(() => {
        if (!ignore) setIsLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <main className="products">
      <h1 className="products-title">Produtos</h1>

      {isLoading && <LoadingSpinner message="Carregando produtos..." />}

      {!isLoading && errorMessage && (
        <p className="products-error" role="alert">
          {errorMessage}
        </p>
      )}

      {!isLoading && !errorMessage && products.length === 0 && (
        <p className="products-empty">Nenhum produto cadastrado por enquanto.</p>
      )}

      {!isLoading && !errorMessage && products.length > 0 && (
        <ul className="products-grid">
          {products.map((product) => (
            <li key={product.id}>
              <Card title={product.name} subtitle={product.description}>
                {currencyFormatter.format(product.price ?? 0)}
              </Card>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
