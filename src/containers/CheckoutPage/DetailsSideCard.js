import React from 'react';
import { node, object, string } from 'prop-types';
import axios from 'axios'; // Import axios
import { v4 as uuidv4 } from 'uuid'; // Import uuid

import { FormattedMessage } from '../../util/reactIntl';
import { propTypes } from '../../util/types';
import { createSlug } from '../../util/urlHelpers';
import { formatMoney } from '../../util/currency';

import {
  Button,
  AspectRatioWrapper,
  AvatarMedium,
  H4,
  H6,
  NamedLink,
  ResponsiveImage,
} from '../../components';

import css from './CheckoutPage.module.css';

const DetailsSideCard = props => {
  const {
    listing,
    listingTitle,
    author,
    firstImage,
    layoutListingImageConfig,
    speculateTransactionErrorMessage,
    showPrice,
    processName,
    breakdown,
    intl,
  } = props;

  const { price, publicData } = listing?.attributes || {};
  const unitType = publicData.unitType || 'unknown';

  const { aspectWidth = 1, aspectHeight = 1, variantPrefix = 'listing-card' } =
    layoutListingImageConfig || {};
  const variants = firstImage
    ? Object.keys(firstImage?.attributes?.variants).filter(k => k.startsWith(variantPrefix))
    : [];

  // Função para gerar e fazer upload do QR code
  const handleGenerateQRCode = async () => {
    try {
      console.log(breakdown)
      const qrData = { boat_name: listingTitle, author_id: listing.author.id.uuid, author_name: listing.author.attributes.profile.displayName};
      const qrDataJson = JSON.stringify(qrData);

      // Gera o QR code usando a API QuickChart
      const quickchartUrl = "https://quickchart.io/qr";
      const response = await axios.get(quickchartUrl, {
        params: { text: qrDataJson, size: "300" },
        responseType: 'arraybuffer'  // Adicionado para garantir que a imagem seja recebida corretamente
      });

      if (response.status === 200) {
        const imgData = response.data;
        const fileName = `${uuidv4()}.png`; // Usando uuidv4 para gerar um nome de arquivo único
        const storageZoneName = 'ahoy-qr-code';
        const accessKey = '5d1b0c5d-fe35-41e6-8318d24247da-d5a9-40f3'; // Substitua pela sua chave de acesso BunnyCDN
        const baseUrl = "storage.bunnycdn.com";
        const url = `https://${baseUrl}/${storageZoneName}/${fileName}`;

        // Faz upload da imagem para o BunnyCDN
        const uploadResponse = await axios.put(url, imgData, {
          headers: {
            "AccessKey": accessKey,
            "Content-Type": "application/octet-stream",
          },
        });

        if (uploadResponse.status === 200 || uploadResponse.status === 201) {
          const qrCodeUrl = `https://${storageZoneName}.b-cdn.net/${fileName}`;
          console.log("QR code URL:", qrCodeUrl);
          console.log(listing);
        } else {
          console.error(`Failed to upload image. Status code: ${uploadResponse.status}, Response: ${uploadResponse.data}`);
        }
      } else {
        console.error(`Failed to generate QR code. Status code: ${response.status}`);
      }
    } catch (error) {
      console.error("Error generating or uploading QR code:", error);
    }
  };

  return (
    <div className={css.detailsContainerDesktop}>
      <AspectRatioWrapper
        width={aspectWidth}
        height={aspectHeight}
        className={css.detailsAspectWrapper}
      >
        <ResponsiveImage
          rootClassName={css.rootForImage}
          alt={listingTitle}
          image={firstImage}
          variants={variants}
        />
      </AspectRatioWrapper>
      <div className={css.listingDetailsWrapper}>
        <div className={css.avatarWrapper}>
          <AvatarMedium user={author} disableProfileLink />
        </div>
        <div className={css.detailsHeadings}>
          <H4 as="h2">
            <NamedLink
              name="ListingPage"
              params={{ id: listing?.id?.uuid, slug: createSlug(listingTitle) }}
            >
              {listingTitle}
            </NamedLink>
          </H4>
          {showPrice ? (
            <div className={css.priceContainer}>
              <p className={css.price}>{formatMoney(intl, price)}</p>
              <div className={css.perUnit}>
                <FormattedMessage
                  id="CheckoutPageWithInquiryProcess.perUnit"
                  values={{ unitType }}
                />
              </div>
            </div>
          ) : null}
        </div>
        {speculateTransactionErrorMessage}
      </div>

      {!!breakdown ? (
        <div className={css.orderBreakdownHeader}>
          <H6 as="h3" className={css.orderBreakdownTitle}>
            <FormattedMessage id={`CheckoutPage.${processName}.orderBreakdown`} />
          </H6>
          <hr className={css.totalDivider} />
        </div>
      ) : null}
      {breakdown}
      
      {processName === 'default-booking' && (
        <Button onClick={handleGenerateQRCode}>Generate QR CODE</Button>
      )}
    </div>
  );
};

DetailsSideCard.defaultProps = {
  speculateTransactionErrorMessage: null,
  breakdown: null,
};

DetailsSideCard.propTypes = {
  listing: propTypes.listing.isRequired,
  listingTitle: string.isRequired,
  author: propTypes.user.isRequired,
  firstImage: propTypes.image.isRequired,
  layoutListingImageConfig: object.isRequired,
  speculateTransactionErrorMessage: node,
  processName: string.isRequired,
  breakdown: node,
};

export default DetailsSideCard;
