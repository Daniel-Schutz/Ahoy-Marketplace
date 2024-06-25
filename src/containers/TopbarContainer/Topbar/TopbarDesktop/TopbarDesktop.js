import React, { useState, useEffect } from 'react';
import { bool, func, object, number, string } from 'prop-types';
import classNames from 'classnames';
import { QrReader } from 'react-qr-reader';
import axios from 'axios';
import { updateTransactionMetadata } from '../../../../util/api';
import { FormattedMessage, intlShape } from '../../../../util/reactIntl';
import { ACCOUNT_SETTINGS_PAGES } from '../../../../routing/routeConfiguration';
import { propTypes } from '../../../../util/types';

// Contract imports 
import AhoyAddress from '../../../../contractsData/Ahoy-address.json';
import AhoyAbi from '../../../../contractsData/Ahoy.json';
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
import { useWeb3 } from '../../../../context/Web3';

const fetchUpdateTransactionMetadata = (transactionId) => {
  console.log(transactionId)
  const body = {
    transactionId
  }
  updateTransactionMetadata(body)
    .then(response => {
      console.log(response.data)
      return response.data
    })
    .catch(e => {
      console.log(e)
    });
};

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

const ProfileMenu = ({ currentPage, currentUser, onLogout, onUpdateProfile }) => {
  const { hasWeb3, client, web3Handler } = useWeb3();
  const [showQrReader, setShowQrReader] = useState(false);
  // console.log({client})
  const currentPageClass = page => {
    const isAccountSettingsPage =
      page === 'AccountSettingsPage' && ACCOUNT_SETTINGS_PAGES.includes(currentPage);
    return currentPage === page || isAccountSettingsPage ? css.currentPage : null;
  };

  const updateTransactionMetadata = async (transactionId, metadata) => {
    try {
      const response = await axios.post('/v1/integration_api/transactions/update_metadata', {
        transactionId: transactionId,
        metadata: metadata
      }, {
        headers: {
          'Content-Type': 'application/transit+json'
        }
      });
  
      console.log('Metadata updated successfully:', response.data);
    } catch (error) {
      console.error('Error updating metadata:', error.response ? error.response.data : error.message);
    }
  };


  const handleQrScan = (result) => {
    if (result) {
      const jsonString = result?.text
      const qrCodeDict = JSON.parse(jsonString);
      if (qrCodeDict.author_id === currentUser.id.uuid) {
        console.log("This user can verify the qrCode")
          const transactionId = qrCodeDict.transaction_id;
          const response = fetchUpdateTransactionMetadata(transactionId);
          const bookingStatus = response.attributes.metadata.bookingStatus;
          // APOS A CHAMADA DESSA FUNÇÃO, QUERO MOSTRAR UMA MENSAGEM NO FRONTEND COM O BOOKINGSTATUS


      } else{
        console.log("This user can't verify the qrCode")
      }
      setShowQrReader(false);
    }
  };

  const handleQrError = (error) => {
    if (error) {
      console.error("QR Code Error:", error);
    }
  };

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
              style={{ width: '60%', marginLeft: "10px" }}
            >
              Download MetaMask
            </Button>
          ) : client ? (
            <div>
              <Button
                disabled
                style={{
                  backgroundColor: 'green',
                  width: '60%', marginLeft: "10px"
                }}
              >
                {client.account.slice(0, 6) + '...' + client.account.slice(-4)}
              </Button>
            </div>
          ) : (
            <Button
              onClick={web3Handler}
              style={{ width: '60%', marginLeft: "10px" }}
            >
              Connect Wallet
            </Button>
          )}
        </MenuItem>

        <MenuItem key="qrReader">
          <Button
            onClick={() => setShowQrReader(!showQrReader)}
            style={{ width: '60%', marginLeft: "10px", marginTop:'10px' }}
          >
            {showQrReader ? 'Close QR Reader' : 'Open QR Reader'}
          </Button>
          {showQrReader && (
            <div style={{ width: '100%', marginTop: '10px' }}>
              <QrReader
                delay={300}
                onResult={handleQrScan}
                onError={handleQrError}
                style={{ width: '100%' }}
              />
            </div>
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
    onUpdateProfile
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
    <ProfileMenu
      currentPage={currentPage}
      currentUser={currentUser}
      onLogout={onLogout}
      onUpdateProfile={onUpdateProfile}
    />
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
  onUpdateProfile: func.isRequired,
};

export default TopbarDesktop;
