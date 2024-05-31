/**
 *  TopbarMobileMenu prints the menu content for authenticated user or
 * shows login actions for those who are not authenticated.
 */
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

//contract imports 
import AhoyAddress from '../../../../contractsData/Ahoy-address.json'
import AhoyAbi from '../../../../contractsData/Ahoy.json'
import { ethers } from "ethers";

import { ACCOUNT_SETTINGS_PAGES } from '../../../../routing/routeConfiguration';
import { FormattedMessage } from '../../../../util/reactIntl';
import { propTypes } from '../../../../util/types';
import { ensureCurrentUser } from '../../../../util/data';



import {
  AvatarLarge,
  ExternalLink,
  InlineTextButton,
  NamedLink,
  NotificationBadge,
  Button,
} from '../../../../components';

import css from './TopbarMobileMenu.module.css';

const CustomLinkComponent = ({ linkConfig, currentPage }) => {
  const { group, text, type, href, route } = linkConfig;
  const getCurrentPageClass = page => {
    const hasPageName = name => currentPage?.indexOf(name) === 0;
    const isCMSPage = pageId => hasPageName('CMSPage') && currentPage === `${page}:${pageId}`;
    const isInboxPage = tab => hasPageName('InboxPage') && currentPage === `${page}:${tab}`;
    const isCurrentPage = currentPage === page;

    return isCMSPage(route?.params?.pageId) || isInboxPage(route?.params?.tab) || isCurrentPage
      ? css.currentPage
      : null;
  };

  // Note: if the config contains 'route' keyword,
  // then in-app linking config has been resolved already.
  if (type === 'internal' && route) {
    // Internal link
    const { name, params, to } = route || {};
    const className = classNames(css.navigationLink, getCurrentPageClass(name));
    return (
      <NamedLink name={name} params={params} to={to} className={className}>
        <span className={css.menuItemBorder} />
        {text}
      </NamedLink>
    );
  }
  return (
    <ExternalLink href={href} className={css.navigationLink}>
      <span className={css.menuItemBorder} />
      {text}
    </ExternalLink>
  );
};

const TopbarMobileMenu = props => {
  const {
    isAuthenticated,
    currentPage,
    currentUserHasListings,
    currentUser,
    notificationCount,
    customLinks,
    onLogout,
  } = props;

  const user = ensureCurrentUser(currentUser);

  const extraLinks = customLinks.map(linkConfig => {
    return (
      <CustomLinkComponent
        key={linkConfig.text}
        linkConfig={linkConfig}
        currentPage={currentPage}
      />
    );
  });

  if (!isAuthenticated) {
    const signup = (
      <NamedLink name="SignupPage" className={css.signupLink}>
        <FormattedMessage id="TopbarMobileMenu.signupLink" />
      </NamedLink>
    );

    const login = (
      <NamedLink name="LoginPage" className={css.loginLink}>
        <FormattedMessage id="TopbarMobileMenu.loginLink" />
      </NamedLink>
    );

    const signupOrLogin = (
      <span className={css.authenticationLinks}>
        <FormattedMessage id="TopbarMobileMenu.signupOrLogin" values={{ signup, login }} />
      </span>
    );
    return (
      <div className={css.root}>
        <div className={css.content}>
          <div className={css.authenticationGreeting}>
            <FormattedMessage
              id="TopbarMobileMenu.unauthorizedGreeting"
              values={{ lineBreak: <br />, signupOrLogin }}
            />
          </div>

          <div className={css.customLinksWrapper}>{extraLinks}</div>

          <div className={css.spacer} />
        </div>
        <div className={css.footer}>
          <NamedLink className={css.createNewListingLink} name="NewListingPage">
            <FormattedMessage id="TopbarMobileMenu.newListingLink" />
          </NamedLink>
        </div>
      </div>
    );
  }

  const notificationCountBadge =
    notificationCount > 0 ? (
      <NotificationBadge className={css.notificationBadge} count={notificationCount} />
    ) : null;

  const displayName = user.attributes.profile.firstName;
  const currentPageClass = page => {
    const isAccountSettingsPage =
      page === 'AccountSettingsPage' && ACCOUNT_SETTINGS_PAGES.includes(currentPage);
    const isInboxPage = currentPage?.indexOf('InboxPage') === 0 && page?.indexOf('InboxPage') === 0;
    return currentPage === page || isAccountSettingsPage || isInboxPage ? css.currentPage : null;
  };
  const inboxTab = currentUserHasListings ? 'sales' : 'orders';

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
    <div className={css.root}>
      <AvatarLarge className={css.avatar} user={currentUser} />
      <div className={css.content}>
        <span className={css.greeting}>
          <FormattedMessage id="TopbarMobileMenu.greeting" values={{ displayName }} />
        </span>
        <InlineTextButton rootClassName={css.logoutButton} onClick={onLogout}>
          <FormattedMessage id="TopbarMobileMenu.logoutLink" />
        </InlineTextButton>

        <div className={css.accountLinksWrapper}>
          <NamedLink
            className={classNames(css.inbox, currentPageClass(`InboxPage:${inboxTab}`))}
            name="InboxPage"
            params={{ tab: inboxTab }}
          >
            <FormattedMessage id="TopbarMobileMenu.inboxLink" />
            {notificationCountBadge}
          </NamedLink>
          <NamedLink
            className={classNames(css.navigationLink, currentPageClass('ManageListingsPage'))}
            name="ManageListingsPage"
          >
            <FormattedMessage id="TopbarMobileMenu.yourListingsLink" />
          </NamedLink>
          <NamedLink
            className={classNames(css.navigationLink, currentPageClass('ProfileSettingsPage'))}
            name="ProfileSettingsPage"
          >
            <FormattedMessage id="TopbarMobileMenu.profileSettingsLink" />
          </NamedLink>
          <NamedLink
            className={classNames(css.navigationLink, currentPageClass('AccountSettingsPage'))}
            name="AccountSettingsPage"
          >
            <FormattedMessage id="TopbarMobileMenu.accountSettingsLink" />
          </NamedLink>
          {!hasWeb3 ? (
            <Button 
              href="https://metamask.io/" 
              target="_blank" 
              rel="noopener noreferrer"

            >
              Download MetaMask
            </Button>
          ) : client.account ? (
            <div>
              <Button 
                disabled 
                style={{ 
                  backgroundColor: 'green',
      
                }}
              >
                {client.account.slice(0, 6) + '...' + client.account.slice(-4)}
              </Button>
            </div>
          ) : (
            <Button 
              onClick={web3Handler}
            >
              Connect Wallet
            </Button>
          )}

          
        </div>
        <div className={css.customLinksWrapper}>{extraLinks}</div>
        <div className={css.spacer} />
      </div>
      <div className={css.footer}>
        <NamedLink className={css.createNewListingLink} name="NewListingPage">
          <FormattedMessage id="TopbarMobileMenu.newListingLink" />
        </NamedLink>
      </div>
    </div>
  );
};

TopbarMobileMenu.defaultProps = { currentUser: null, notificationCount: 0, currentPage: null };

const { bool, func, number, string } = PropTypes;

TopbarMobileMenu.propTypes = {
  isAuthenticated: bool.isRequired,
  currentUserHasListings: bool.isRequired,
  currentUser: propTypes.currentUser,
  currentPage: string,
  notificationCount: number,
  onLogout: func.isRequired,
};

export default TopbarMobileMenu;
