

export default function Register() {
  return (
   <main className="flex justify-center items-center m-10">
     <div className="w-auto h-auto bg-[#FFFFFF]  px-10  py-5 flex flex-col gap-5 rounded-[100px] border-4 border-purple-400 ">
      <h1 className="text=3xl font-bold text-center ">
        SignUp
        </h1>      

        <form className="flex flex-col gap-4 justify-center items-center" >
          <div className= "flex ">
          <lable className="text-center text-[#2E1065] px-2">
            Enter your Name:
          </lable>
          <input type="text" placeholder="Enter Name" className="h-auto border border-[#C4B5FD] rounded-3xl px-1"/>
          </div>
           <div className= "flex ">
          <lable className="text-center text-[#2E1065] px-2">
            Enter your age:
          </lable>
          <input type="number" placeholder="enter age" className="h-auto border border-[#C4B5FD] rounded-3xl px-1"/>
          </div>
           <div className= "flex ">
          <lable className="text-center text-[#2E1065] px-2">
            Enter your gender:
          </lable>
          <select className="rounded-2xl border-2 border-[#C4B5FD]">
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="others">Others</option>
          </select>
          </div>
           <div className= "flex ">
          <lable className="text-center text-[#2E1065] px-2">
            Purpose of creating account:
          </lable>
          <select className="rounded-2xl border-2 border-[#C4B5FD]">
            <option value="">Select Gender</option>
            <option value="customer">Find a buddy</option>
            <option value="companion">Become a Buddy</option>
          </select>
          </div>
           <div className= "flex ">
          <lable className="text-center text-[#2E1065] px-2">
            Enter your Email:
          </lable>
          <input type="email" placeholder="email@emai.com" className="h-auto border border-[#C4B5FD] rounded-3xl px-1"/>
          </div>
           <div className= "flex ">
          <lable className="text-center text-[#2E1065] px-2">
            Enter password:
          </lable>
          <input type="password"  className="h-auto border border-[#C4B5FD] rounded-3xl px-1"/>
          </div>
           <div className= "flex ">
          <lable className="text-center text-[#2E1065] px-2">
            Conform password:
          </lable>
          <input type="password"  className="h-auto border border-[#C4B5FD] rounded-3xl px-1"/>
          </div>

          <button className="bg-[#5B21B6] h-auto w-25 text-[#FFFFFF] rounded-2xl text-center py-1 ">
            Submit
          </button>
        </form>
    </div>
   </main>
  )
}
