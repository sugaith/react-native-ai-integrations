import { Dispatch } from 'react'
import { Input } from 'tamagui'

type SearchInputProp = {
  searchQuery: string
  setSearchQuery: Dispatch<React.SetStateAction<string>>
}

function SearchInput({ searchQuery, setSearchQuery }: SearchInputProp) {
  return (
    <Input
      placeholder="Search past chats..."
      value={searchQuery}
      onChangeText={setSearchQuery}
      borderWidth={1}
      borderColor="$gray300"
      borderRadius="$4"
      marginBottom="$4"
      padding="$3"
      backgroundColor="$gray100"
      placeholderTextColor="$gray10"
    />
  )
}

export type { SearchInputProp }
export { SearchInput }
