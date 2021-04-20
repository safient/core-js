import React, { useState, useEffect } from 'react';

import {
  Text,
  Link,
  Button,
  Select,
  Spinner,
  Row,
  Input,
  Image,
  useModal,
} from '@geist-ui/react';

import makeStyles from './makeStyles';
import EventListItem from './EventListItem.js';
import CreateSafeModal from './modals/CreateSafe';
import PortfolioCard from './SafeCard';
import Safe from './modals/Safe';
import Loader from './modals/Loader';
import {
  getLoginUser,
  getAllUsers,
} from '../lib/safexDb';
import * as Icons from 'react-feather';

const useStyles = makeStyles((ui) => ({
  root: {
    backgroundColor: ui.background,
  },
  content: {
    width: ui.layout.pageWidthWithMargin,
    maxWidth: '100%',
    boxSizing: 'border-box',
    margin: '0 auto',
    padding: `calc(${ui.layout.gap} * 2) ${ui.layout.pageMargin} calc(${ui.layout.gap} * 4)`,
    transform: 'translateY(-35px)',
  },
  invite: {
    display: 'flex',
  },
  inviteHeading: {
    marginBottom: 18,
    fontSize: '14px !important',
  },
  row: {
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    minWidth: 1,
    maxWidth: '100%',
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'stretch',
  },
  projects: {
    width: '100%',
  },
  textRoot: {
    borderBottom: `solid 1px ${ui.palette.accents_2}`,
    padding: '10px 0px',
    alignItems: 'center',
    display: 'flex',
    fontSize: 14,
  },
  message: {
    fontSize: '14px !important',
    margin: 0,
    flex: 1,
  },
  activity: {
    flex: 1,
  },
  [`@media screen and (min-width: ${ui.layout.pageWidthWithMargin})`]: {
    row: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    projects: {
      width: 540,
      maxWidth: '100%',
      marginRight: 80,
    },
    activityTitle: {
      marginTop: '20 !important',

      fontSize: '14px !important',
      textAlign: 'start !important',
    },
    viewAll: {
      marginBottom: '0 !important',
      textAlign: 'start !important',
    },
    invite: {
      display: 'flex',
      justifyContent: 'space-between',
    },
  },
  viewAll: {
    fontSize: 14,
    fontWeight: 700,
    marginBottom: ui.layout.gap,
    textAlign: 'center',
  },
  activityTitle: {
    fontWeight: 700,
    marginTop: ui.layout.gap,
    fontSize: 24,
    textAlign: 'center',
  },

  btnAccept: {
    marginRight: '8px',
  },
}));

const Content = ({ idx, user, userData }) => {
  const [caller, setCaller] = useState(null);
  const [userArray, setUserArray] = useState([{}]);

  console.log(userData)

  const [requested, setRequested] = useState([]);
  const [sharedPortfolio, setSharedPortfolio] = useState([]);
  const [selectedPortfolio, setSelectedPortfolio] = useState({});
  const [portfolioModal, setPortfolioModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loaderData, setLoaderData] = useState({});
  const [searchResults, setSearchResults] = useState(false);

  useEffect(() => {
    async function load() {
      if (idx && user === 2) {
        const { userArray, caller } = await getAllUsers(userData.did);
        setSharedPortfolio(userData.safes)
        setCaller(userData);
        setUserArray(userArray);
      }
    }
    load();
  }, [idx, user]);

  const onClickCard = (safe) => {
    setSelectedPortfolio(safe);
    setPortfolioModal(true);
  };

  const handleClick = async () => {
        setSearchResults(true);
  };

  const fetchUserDetails = async () => {
    setLoaderData({
      heading: 'Fetch portfolio',
      content: 'Fetching portfolio',
    });
    setLoading(true);
    const userData = await getLoginUser(idx.id);
    setSharedPortfolio(userData.safes);
    setLoading(false);
  };



  const classes = useStyles();
  return (
    <>
      <Loader
        loading={loading}
        heading={loaderData.heading}
        content={loaderData.content}
      />
      <CreateSafeModal
        idx={idx}
        searchResults={searchResults}
        setSearchResults={setSearchResults}
        caller={caller}
        requested={requested}
      />
      {/* <TestModal searchResults={searchResults} /> */}
      <Safe
        state={portfolioModal}
        idx={idx}
        safe={selectedPortfolio}
        user={user}
        setSafeModal={setPortfolioModal}
      />
      <div className={classes.root}>
        <div className={classes.content}>
          <Row>
            <Text h3>All safes</Text>
            <Button
              // aria-label='Toggle Dark mode'
              // className={classes.themeIcon}
              auto
              type='abort'
              onClick={fetchUserDetails}
            >
              <Icons.RefreshCcw size={16} />
            </Button>
          </Row>
          <div className={classes.row}>
            <div className={classes.projects}>
              {sharedPortfolio.length > 0 ? (
                sharedPortfolio.map((value) => {
                  return (
                    <PortfolioCard
                      // name={value.senderName}
                      address={value.safeId}
                      email={value.type}
                      onClickCard={() => {
                        onClickCard(value);
                      }}
                    />
                  );
                })
              ) : (
                // <Text>No shared portfolios</Text>
                <div style={{ background: '#fff', padding: '24px', textAlign: 'center' }}>
                  <Image
                    src='/assets/safe.svg'
                    alt='No safes found'
                    width={350}
                  />
                   <Text> No Safe Found </Text>
                </div>
               
              )}
            </div>

            {/* right- */}

            <div className={classes.activity}>
              <Text h2 className={classes.inviteHeading}>
                Create a safe
              </Text>
              <div className={classes.invite}>
                <Button
                  size='small'
                  auto
                  icon={<Icons.Key />}
                  type='secondary'
                  onClick={handleClick}
                >
                  Create Safe
                </Button>
              </div>

              <Text h2 className={classes.activityTitle}>
                Recent Activities
              </Text>

              {requested.length > 0 ? (
                requested.map((value) => {
                  return (
                    <EventListItem
                      username='ofekashery'
                      avatar='/assets/avatar.png'
                      created='3d'
                    >
                      Requested <b>{value.name}'s</b> Portfolio access.
                    </EventListItem>
                  );
                })
              ) : (
                <Text className={classes.message}>No activity</Text>
              )}
              <Text className={classes.viewAll}>
                <Link color>View more</Link>
              </Text>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Content;
