import { useCallback } from 'react'
import { HookFetcher } from '../src/utils/types'
import { CommerceError } from '../src/utils/errors'
import useWishlistAddItem from '../src/wishlist/use-add-item'
import type { ItemBody, AddItemBody } from '../api/wishlist'
import useCustomer from '../account/use-customer'
import useWishlist, { UseWishlistOptions, Wishlist } from './use-wishlist'

const defaultOpts = {
  url: '/api/bigcommerce/wishlist',
  method: 'POST',
}

export type AddItemInput = ItemBody

export const fetcher: HookFetcher<Wishlist, AddItemBody> = (
  options,
  { item },
  fetch
) => {
  // TODO: add validations before doing the fetch
  return fetch({
    ...defaultOpts,
    ...options,
    body: { item },
  })
}

export function extendHook(customFetcher: typeof fetcher) {
  const useAddItem = (opts?: UseWishlistOptions) => {
    const { data: customer } = useCustomer()
    const { revalidate } = useWishlist(opts)
    const fn = useWishlistAddItem(defaultOpts, customFetcher)

    return useCallback(
      async function addItem(input: AddItemInput) {
        if (!customer) {
          // A signed customer is required in order to have a wishlist
          throw new CommerceError({
            message: 'Signed customer not found',
          })
        }

        const data = await fn({ item: input })
        await revalidate()
        return data
      },
      [fn, revalidate, customer]
    )
  }

  useAddItem.extend = extendHook

  return useAddItem
}

export default extendHook(fetcher)
