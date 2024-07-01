import Header from "./components/header";
import Footer from "./components/footer";
import BG from "./components/bg";

export default function App() {
  return (
    <div className="content-wrapper max-w-screen-2xl text-lg mx-auto px-8">
      <Header />
      <BG />
      <main className="max-w-[1392px] px-10 mx-auto my-5">
        <div className="py-10 text-center">
          <div className="text-[#0c5876] text-5xl font-semibold">MyEtherWallet</div>
        </div>
        <div className="py-5 text-center text-7xl font-bold">
          <div className="px-32">The most reputable, friendly, and secure crypto wallet</div>
        </div>
        <div className="flex items-center justify-center text-center">
          <div className="">
            <div className="cursor-pointer text-3xl text-white bg-blue-700 rounded-[20px] py-5 px-7 m-5 font-semibold ct-hover-opacity">Create a new wallet</div>
            <p className="text-2xl">
              or &nbsp;
              <a href="/" className="underline ct-hover-opacity">Access my wallet</a>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div> // end content-wrapper
  )
}