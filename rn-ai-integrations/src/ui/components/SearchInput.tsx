import { Dispatch } from 'react'
import { TextInput } from 'react-native'

type SearchInputProp = {
  searchQuery: string
  setSearchQuery: Dispatch<React.SetStateAction<string>>
}

function SearchInput({ searchQuery, setSearchQuery }: SearchInputProp) {
  return (
    <TextInput
      placeholder="Search past chats..."
      value={searchQuery}
      onChangeText={setSearchQuery}
      placeholderTextColor="gray"
    />
  )
}

export type { SearchInputProp }
export { SearchInput }
