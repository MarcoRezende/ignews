import { useEffect, useState } from 'react';

export function Async() {
  const [isButtonVisible, setIsButtonVisible] = useState(false);
  const [isButtonInvisible, setIsButtonInvisible] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setIsButtonVisible(true);
      setIsButtonInvisible(true);
    }, 1000);
  }, []);

  return (
    <div>
      <h1>Hello World!</h1>

      {isButtonVisible && <button>Button 1</button>}
      {!isButtonInvisible && <button>Button 2</button>}
    </div>
  );
}
