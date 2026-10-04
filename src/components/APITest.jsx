/**
 * Testa se o frontend consegue se comunicar com o backend
 */

import { useState, useEffect } from 'react';
import { fetchApiHealth } from '../services/api';

export default function APITest() {
  const [apiStatus, setApiStatus] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    fetchApiHealth()
      .then(setApiStatus)
      .catch((error) => {
        console.error('Erro ao conectar com a API:', error);
        setErrorMessage('Não foi possível conectar com a API');
      });
  }, []);

  return (
    <div>
      {errorMessage && <p>Erro: {errorMessage}</p>}
      {apiStatus && <p>API Status: {JSON.stringify(apiStatus)}</p>}
    </div>
  );
}