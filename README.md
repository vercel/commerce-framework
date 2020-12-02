# Next.js Commerce Framework

This repository serves as a model to build your own hooks for [Next.js Commerce](https://nextjs.org/commerce). We encourage contributors and teams to build their own hooks under a separate package with the corresponding configuration. An example of using this repository as a seed are the hooks we built with [BigCommerce](https://github.com/bigcommerce/storefront-data-hooks).

## Proposed Commerce API

### CommerceProvider

The main configuration provider that creates the Commerce context. Used by all Commerce hooks. Every provider may define its own defaults.

```jsx
import { CommerceProvider } from "@commerce-framework";

const App = ({ locale = "en-US", children }) => (
  <CommerceProvider locale={locale}>{children}</CommerceProvider>
);
```

- `locale:` Locale to use for i18n. This is **required**.
- `cartCookie:` Name of the cookie that saves the cart id. This is **optional**.
- `fetcher:` Global fetcher function that will be used for every API call to a GraphQL or REST endpoint in the browser, it's in charge of error management on network errors. Usage of this config is **optional**.

> **CommerceProvider** should not re-render unless a prop changes, and the only prop that's expected to change in most apps is `locale`.

### useCommerce()

Returns the configs (including defaults) that are defined in the nearest `CommerceProvider`.

```jsx
import { useCommerce } from "@commerce-framework/hooks";

const commerce = useCommerce();
```

May be useful if you want to create another `CommerceProvider` and extend its options.

### useCustomer

Returns the logged-in customer and its data.

```jsx
import { useCustomer } from "@commerce-framework/hooks";

const customer = useCustomer();
const { data, error, loading } = customer;

if (error) return <p>There was an error: {error.message}</p>;
if (loading) return <p>Loading...</p>;

return <Page customer={data} />;
```

The customer is revalidated by operations executed by `useLogin`, `useSignup` and `useLogout`.

### useLogin Hook

Returns a function that allows a visitor to login into its customer account.

```jsx
import { useLogin } from "@commerce-framework/hooks";

const LoginView = () => {
  const login = useLogin();

  const handleLogin = async () => {
    await login({
      email,
      password,
    });
  };

  return <form onSubmit={handleLogin}>{children}</form>;
};
```

### useLogout

Returns a function that allows the current customer to log out.

```jsx
import { useLogout } from "@commerce-framework/hooks";

const LogoutLink = () => {
  const logout = useLogout();
  return <a onClick={() => logout()}>Logout</a>;
};
```

### useSignup

Returns a function that allows a visitor to sign up into the store.
The signup operation returns `null`.

```jsx
import { useSignup } from "@commerce-framework/hooks";

const SignupView = () => {
  const signup = useSignup();

  const handleSignup = async () => {
    await signup({
      email,
      firstName,
      lastName,
      password,
    });
  };

  return <form onSubmit={handleSignup}>{children}</form>;
};
```

### usePrice

Formats an amount--usually the price of a product-- into an internationalized string. It uses the current locale.

```jsx
import { usePrice } from "@commerce-framework/hooks";

const { price, basePrice, discount } = usePrice({
  amount: 100,
  baseAmount: 50,
  currencyCode: "USD",
});
```

`usePrice` receives an object with:

- `amount:` A valid number, usually the sale price of a product. This is **required**.
- `baseAmount:` A valid number, usually the listed price of a product. If it's higher than `amount` then the product is on sale and `usePrice` will return the discounted percentage. This is **optional**.
- `currencyCode:` The currency code to use. This is **required**.

`usePrice` returns an object with:

- `price:` The formatted price of a product.
- `basePrice:` The formatted base price of the product. Only present if `baseAmount` is set.
- `discount:` The discounted percentage. Only present if `baseAmount` is set.

## Cart Hooks

### useCart

Returns the current cart data.

```jsx
import { useCart } from "@commerce-framework/hooks";

const { data, error, isEmpty, loading } = useCart();
```

### useAddItem

Returns a function that when called adds a new item to the current cart.
The `addItem` operation returns the updated cart.

```jsx
import { useAddItem } from "@commerce-framework/hooks";

const AddToCartButton = ({ productId, variantId }) => {
  const addItem = useAddItem();

  const addToCart = async () => {
    await addItem({
      productId,
      variantId,
    });
  };

  return <button onClick={addToCart}>Add To Cart</button>;
};
```

### useUpdateItem

Returns a function to update an item of the current cart.

```jsx
const updateItem = useUpdateItem();

await updateItem({
  id,
  productId,
  variantId,
  quantity,
});

// You can optionally send the item to the hook:
const updateItem = useUpdateItem(item);

// And now only the quantity is required
await updateItem({
  quantity,
});
```

### useRemoveItem

Returns a function that when called removes an item from the current cart.

```jsx
const removeItem = useRemoveItem();

await removeItem({
  id,
});
```

The `removeItem` operation returns the updated cart.

The cart is deleted if the last remaining item is removed.

## Wishlist Hooks

### useWishlist

Returns the current wishlist of the logged in user.

```jsx
import { useWishlist } from "@commerce-framework/hooks";

const { data } = useWishlist();
```

## WIP

- getItem
- getAllItems
- useSearch

## Handling errors and loading states

Data fetching looks like `useCart` and `useCustomer` return props to handle errors and loading states. For example, using the `useCommerce` hook:

```jsx
const customer = useCustomer();
const { data, error, loading } = customer;

if (error) return <p>There was an error: {error.message}</p>;
if (loading) return <p>Loading...</p>;

return <Page customer={data} />;
```

And using the `useCart` hook:

```jsx
const cart = useCart();
const { data, error, loading, isEmpty } = cart;

if (error) return <p>There was an error: {error.message}</p>;
if (loading) return <p>Loading...</p>;
if (isEmpty) return <p>The cart is currently empty</p>;

return <Page cart={data} />;
```

Hooks that execute user actions are async operations, you can track the loading state and errors using state hooks and try...catch. For example:

```jsx
function LoginButton({ data }) {
  const login = useLogin();

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(false);
  const handleClick = async () => {
    // We're about to run the action, so set the state to loading
    setLoading(true);
    // Reset the error message if it failed before
    setErrorMsg("");

    try {
      await login({
        email: data.email,
        password: data.password,
      });
    } catch (error) {
      // Handle error codes specific for the `login` action
      if (error.code === "invalid_credentials") {
        setErrorMsg(
          "Cannot find an account that matches the provided credentials"
        );
      } else {
        setErrorMsg(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={handleClick} disabled={loading}>
        Add to Cart
      </button>
      {errorMsg && <p>{errorMsg}</p>}
    </div>
  );
}
```

Error codes depend on the hook that is being used. In this case `invalid_credentials` is used by `useLogin`.

All commerce related errors are an instance of `CommerceError`.

## Extending UI Hooks

All hooks that involve a fetch operation can be extended with a custom fetcher function. For example, if we wanted to extend the `useCart` hook:

```jsx
import useCartHook, { fetcher } from "commerce-lib/cart/use-cart";

const useCart = useCartHook.extend(
  (options, input, fetch) => {
    // Do something different
    return fetcher(options, input, fetch);
  },
  {
    // Optionally change the default SWR options
    revalidateOnFocus: true,
  }
);

// Then in your component, using your new hook works in the same way
const { data, error, isEmpty, updating } = useCart();
```

The `extend` method is available for all hooks with fetch operations, it receives a fetcher function as the first parameter and SWR options as the second parameter if the hook uses SWR. `extend` returns a new hook that works exactly as the hook it's extending from.

The fetcher function receives the following arguments:

- `options:` This is an object that may have a `query` (if the hook is using GraphQL), a `url`, and a `method`.
- `input:` An object with the data that's required to execute the operation.
- `fetch:` The fetch function that is set by the `CommerceProvider`.

## Folder Structure

The root folder contains an `index.tsx` file with the CommerceProvider to set up the right commerce context. Additional components needed to run the framework need to be there.

`src` contains all the handlers used by the whole framework. The rest of the folders in the root file are named by functionality, e.g cart, auth, wishlist and are the API of the framework. Therefore, most of the work should be done in the `src` folder. Otherwise, it could affect the usage of the framework altering its functionality and possibly adding unexpected output.
