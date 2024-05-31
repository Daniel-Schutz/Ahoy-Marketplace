import React, { useState, useEffect } from 'react';
import { bool, func, object, number, string } from 'prop-types';
import classNames from 'classnames';

import { FormattedMessage, intlShape } from '../../../../util/reactIntl';
import { ACCOUNT_SETTINGS_PAGES } from '../../../../routing/routeConfiguration';
import { propTypes } from '../../../../util/types';

//contract imports 
import AhoyAddress from '../../../../contractsData/Ahoy-address.json'
import AhoyAbi from '../../../../contractsData/Ahoy.json'
import { ethers } from "ethers";

import {
  Avatar,
  InlineTextButton,
  LinkedLogo,
  Menu,
  MenuLabel,
  MenuContent,
  MenuItem,
  NamedLink,
  Button,
} from '../../../../components';

import TopbarSearchForm from '../TopbarSearchForm/TopbarSearchForm';
import CustomLinksMenu from './CustomLinksMenu/CustomLinksMenu';

import css from './TopbarDesktop.module.css';

const SignupLink = () => {
  return (
    <NamedLink name="SignupPage" className={css.topbarLink}>
      <span className={css.topbarLinkLabel}>
        <FormattedMessage id="TopbarDesktop.signup" />
      </span>
    </NamedLink>
  );
};

const LoginLink = () => {
  return (
    <NamedLink name="LoginPage" className={css.topbarLink}>
      <span className={css.topbarLinkLabel}>
        <FormattedMessage id="TopbarDesktop.login" />
      </span>
    </NamedLink>
  );
};

const InboxLink = ({ notificationCount, currentUserHasListings }) => {
  const notificationDot = notificationCount > 0 ? <div className={css.notificationDot} /> : null;
  return (
    <NamedLink
      className={css.topbarLink}
      name="InboxPage"
      params={{ tab: currentUserHasListings ? 'sales' : 'orders' }}
    >
      <span className={css.topbarLinkLabel}>
        <FormattedMessage id="TopbarDesktop.inbox" />
        {notificationDot}
      </span>
    </NamedLink>
  );
};

const ProfileMenu = ({ currentPage, currentUser, onLogout }) => {
  const currentPageClass = page => {
    const isAccountSettingsPage =
      page === 'AccountSettingsPage' && ACCOUNT_SETTINGS_PAGES.includes(currentPage);
    return currentPage === page || isAccountSettingsPage ? css.currentPage : null;
  };

  const [client, setClient] = useState({
    account: null,
    signer: null,
    chainId: null,
    provider: null
});
const [hasWeb3, setHasWeb3] = useState(false);

const web3Handler = async () => {

  var account; var chainId;

  await window.ethereum.request({ method: 'eth_requestAccounts' })
  .then((accounts) => {
    account = accounts[0] });

  await window.ethereum.request({ method: 'eth_chainId' })
  .then((res) => {
    chainId = res });

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const balance = await provider.getBalance(account);
    let balanceInEther = ethers.utils.formatEther(balance);
    balanceInEther = Math.floor(balanceInEther)
    
    const signer = await provider.getSigner();

    setClient({
      account: account,
      signer: signer,
      chainId: parseInt(chainId, 16),
      provider: provider,
      balanceInEther,
    })

    loadContracts(client.account)

    currentUser.updateProfile(
      { client: { client } }
    )
    console.log(currentUser)
}


const loadContracts = async (signer) => {
  // Get deployed copies of contracts
  const ahoy = new ethers.Contract(AhoyAddress.address, AhoyAbi.abi, signer)
  // const ahoyRentals = new ethers.Contract(AhoyRentalAddress.address, AhoyRentalAbi.abi, signer)
  // console.log("Ahoy contract address:", ahoy.address);
  // console.log("Ahoy Rental contract address:", ahoyRentals.address);

  // const owner = await ahoyRentals.getOwner();

  console.log(ahoy)
}

if (window.ethereum) {
  window.ethereum.on('chainChanged', () => {window.location.reload()});
  window.ethereum.on('accountsChanged', () => {window.location.reload()});
  if(!hasWeb3) { setHasWeb3(true); }
  console.log(client)
}


  return (
    <Menu>
      <MenuLabel className={css.profileMenuLabel} isOpenClassName={css.profileMenuIsOpen}>
        <Avatar className={css.avatar} user={currentUser} disableProfileLink />
      </MenuLabel>
      <MenuContent className={css.profileMenuContent}>
        <MenuItem key="ManageListingsPage">
          <NamedLink
            className={classNames(css.menuLink, currentPageClass('ManageListingsPage'))}
            name="ManageListingsPage"
          >
            <span className={css.menuItemBorder} />
            <FormattedMessage id="TopbarDesktop.yourListingsLink" />
          </NamedLink>
        </MenuItem>
        <MenuItem key="ProfileSettingsPage">
          <NamedLink
            className={classNames(css.menuLink, currentPageClass('ProfileSettingsPage'))}
            name="ProfileSettingsPage"
          >
            <span className={css.menuItemBorder} />
            <FormattedMessage id="TopbarDesktop.profileSettingsLink" />
          </NamedLink>
        </MenuItem>
        <MenuItem key="AccountSettingsPage">
          <NamedLink
            className={classNames(css.menuLink, currentPageClass('AccountSettingsPage'))}
            name="AccountSettingsPage"
          >
            <span className={css.menuItemBorder} />
            <FormattedMessage id="TopbarDesktop.accountSettingsLink" />
          </NamedLink>
        </MenuItem>
        <MenuItem key="button">
          {!hasWeb3 ? (
            <Button 
              href="https://metamask.io/" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ width: '60%', marginLeft:"10px" }}
            >
              Download MetaMask
            </Button>
          ) : client.account ? (
            <div>
              <Button 
                disabled 
                style={{ 
                  backgroundColor: 'green',
                  width: '60%', marginLeft:"10px"
                }}
              >
                {client.account.slice(0, 6) + '...' + client.account.slice(-4)}
              </Button>
            </div>
          ) : (
            <Button 
              onClick={web3Handler}
              style={{ width: '60%', marginLeft:"10px" }}
            >
              Connect Wallet
            </Button>
          )}
        </MenuItem>

        <MenuItem key="logout">
          <InlineTextButton rootClassName={css.logoutButton} onClick={onLogout}>
            <span className={css.menuItemBorder} />
            <FormattedMessage id="TopbarDesktop.logout" />
          </InlineTextButton>
        </MenuItem>
      </MenuContent>
    </Menu>
  );
};

const TopbarDesktop = props => {
  const {
    className,
    config,
    customLinks,
    currentUser,
    currentPage,
    rootClassName,
    currentUserHasListings,
    notificationCount,
    intl,
    isAuthenticated,
    onLogout,
    onSearchSubmit,
    initialSearchFormValues,
  } = props;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const marketplaceName = config.marketplaceName;
  const authenticatedOnClientSide = mounted && isAuthenticated;
  const isAuthenticatedOrJustHydrated = isAuthenticated || !mounted;

  const giveSpaceForSearch = customLinks == null || customLinks?.length === 0;
  const classes = classNames(rootClassName || css.root, className);

  const inboxLinkMaybe = authenticatedOnClientSide ? (
    <InboxLink
      notificationCount={notificationCount}
      currentUserHasListings={currentUserHasListings}
    />
  ) : null;

  const profileMenuMaybe = authenticatedOnClientSide ? (
    <ProfileMenu currentPage={currentPage} currentUser={currentUser} onLogout={onLogout} />
  ) : null;

  const signupLinkMaybe = isAuthenticatedOrJustHydrated ? null : <SignupLink />;
  const loginLinkMaybe = isAuthenticatedOrJustHydrated ? null : <LoginLink />;

  return (
    <nav className={classes}>
      <LinkedLogo
        className={css.logoLink}
        layout="desktop"
        alt={intl.formatMessage({ id: 'TopbarDesktop.logo' }, { marketplaceName })}
        linkToExternalSite={config?.topbar?.logoLink}
      />
      <TopbarSearchForm
        className={classNames(css.searchLink, { [css.takeAvailableSpace]: giveSpaceForSearch })}
        desktopInputRoot={css.topbarSearchWithLeftPadding}
        onSubmit={onSearchSubmit}
        initialValues={initialSearchFormValues}
        appConfig={config}
      />

      <CustomLinksMenu
        currentPage={currentPage}
        customLinks={customLinks}
        intl={intl}
        hasClientSideContentReady={authenticatedOnClientSide || !isAuthenticatedOrJustHydrated}
      />

      {inboxLinkMaybe}
      {profileMenuMaybe}
      {signupLinkMaybe}
      {loginLinkMaybe}
    </nav>
  );
};

TopbarDesktop.defaultProps = {
  rootClassName: null,
  className: null,
  currentUser: null,
  currentPage: null,
  notificationCount: 0,
  initialSearchFormValues: {},
  config: null,
};

TopbarDesktop.propTypes = {
  rootClassName: string,
  className: string,
  currentUserHasListings: bool.isRequired,
  currentUser: propTypes.currentUser,
  currentPage: string,
  isAuthenticated: bool.isRequired,
  onLogout: func.isRequired,
  notificationCount: number,
  onSearchSubmit: func.isRequired,
  initialSearchFormValues: object,
  intl: intlShape.isRequired,
  config: object,
};

export default TopbarDesktop;
