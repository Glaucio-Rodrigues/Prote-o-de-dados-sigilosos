export default function Footer() {
  return (
    <footer className="bg-[#f5f5f5] text-xs text-gray-500 py-6 px-8 flex flex-col md:flex-row justify-between items-center border-t border-gray-200 mt-auto">
      <div className="mb-4 md:mb-0">
        <a href="#" className="text-blue-600 hover:underline mr-2">Como cuidamos da sua privacidade</a>
        - Copyright © 2024 AdvocaciaDocs LTDA.
      </div>
      <div>
        Protegido por reCAPTCHA - <a href="#" className="hover:underline">Privacidade</a> - <a href="#" className="hover:underline">Condições</a>
      </div>
    </footer>
  );
}
