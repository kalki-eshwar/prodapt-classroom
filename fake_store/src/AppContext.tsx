import { createContext } from "react";

export const AppContext = createContext({
  projectTitle: "Fake Store Admin",
})

export const AppProvider = ({ children }: any) => {
  const projectTitle = "Fake Store Admin"

  return (
    <AppContext.Provider value={{ projectTitle }}>
      {children}
    </AppContext.Provider>
  )
}