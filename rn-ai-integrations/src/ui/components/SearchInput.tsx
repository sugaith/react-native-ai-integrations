import { Dispatch } from 'react'
import { TextInput } from 'react-native'

type SearchInputProp = {
  searchQuery: string
  setSearchQuery: Dispatch<React.SetStateAction<string>>
}

function SearchInput({ searchQuery, setSearchQuery }: SearchInputProp) {
  return (
    <TextInput
      className={'bg-background-second m-1.5 rounded-xl text-body'}
      placeholder="Search past chats..."
      value={searchQuery}
      onChangeText={setSearchQuery}
      placeholderTextColor="gray"
    />
  )
}

export type { SearchInputProp }
export { SearchInput }
