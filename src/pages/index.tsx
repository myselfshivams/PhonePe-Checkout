import { useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

const Checkout = () => {
  const [amount, setAmount] = useState<number>(1); 
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();

  const handlePayment = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`/api/pay?amount=${amount}`);
      const redirectUrl = response.data.data.instrumentResponse.redirectInfo.url;
      window.location.href = redirectUrl; 
    } catch (error) {
      console.error('Payment initiation failed:', error);
      alert('Error initiating payment. Please try again.');
    }
    setIsLoading(false);
  };

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>Checkout Page</h1>
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(Number(e.target.value))}
        placeholder="Enter amount"
        style={{ padding: '10px', marginBottom: '20px' }}
      />
      <br />
      <button
        onClick={handlePayment}
        disabled={isLoading}
        style={{
          padding: '10px 20px',
          backgroundColor: 'green',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        {isLoading ? 'Processing...' : 'Pay Now'}
      </button>
    </div>
  );
};

export default Checkout;
