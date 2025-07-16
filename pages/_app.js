import '../styles/globals.css'
import '../lib/firebase'
import { WeatherProvider } from '../contexts/WeatherContext'

function MyApp({ Component, pageProps }) {
  return (
    <WeatherProvider>
      <Component {...pageProps} />
    </WeatherProvider>
  )
}

export default MyApp
