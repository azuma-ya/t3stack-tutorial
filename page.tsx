import { signIn } from '@/auth'

const DevPage = async () => {
  return (
    <div className="flex h-screen items-center justify-center">
      <form
        action={async () => {
          'use server'
          await signIn('google')
        }}
      >
        {/* <Button type="submit" variant="contained">
          Signin with Google
        </Button> */}
        <button type="submit">Signin with Google</button>
      </form>
    </div>
  )
}

export default DevPage
