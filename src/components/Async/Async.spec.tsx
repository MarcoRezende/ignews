import {
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from '@testing-library/react';

import { Async } from '.';

test('it renders correctly', async () => {
  render(<Async />);

  expect(screen.getByText('Hello World!')).toBeInTheDocument();

  await waitForElementToBeRemoved(screen.queryByText('Button 2'));
  await waitFor(
    () => {
      return expect(screen.getByText('Button 1')).toBeInTheDocument();
      // return expect(screen.queryByText('Button 1')).toBeInTheDocument();
      // return expect(screen.findByText('Button 1')).toBeInTheDocument();
    },
    { timeout: 1000 }
  );
});
