import { ethers } from 'ethers';
import logo from '../assets/logo.svg';

const Navigation = ({
    account,
    setAccount,
    userRole,
    activeSection,
    onBuyClick,
    onRentClick,
    onSellClick,
}) => {
    const connectHandler = async () => {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const account = ethers.utils.getAddress(accounts[0])
        setAccount(account);
    }

    return (
        <nav>
            <ul className='nav__links'>
                <li>
                    <button
                        type="button"
                        className={activeSection === 'buy' ? 'nav__link nav__link--active' : 'nav__link'}
                        onClick={onBuyClick}
                    >
                        Buy
                    </button>
                </li>
                <li>
                    <button
                        type="button"
                        className={activeSection === 'rent' ? 'nav__link nav__link--active' : 'nav__link'}
                        onClick={onRentClick}
                    >
                        Rent
                    </button>
                </li>
                <li>
                    <button
                        type="button"
                        className={activeSection === 'sell' ? 'nav__link nav__link--active' : 'nav__link'}
                        onClick={onSellClick}
                    >
                        Sell
                    </button>
                </li>
            </ul>

            <div className='nav__brand'>
                <img src={logo} alt="Logo" />
                <h1>Millow</h1>
            </div>

            {account ? (
                <div className="nav__account">
                    <span className="nav__role">{userRole}</span>
                    <button
                        type="button"
                        className='nav__connect'
                    >
                        {account.slice(0, 6) + '...' + account.slice(38, 42)}
                    </button>
                </div>
            ) : (
                <button
                    type="button"
                    className='nav__connect'
                    onClick={connectHandler}
                >
                    Connect
                </button>
            )}
        </nav>
    );
}

export default Navigation;
