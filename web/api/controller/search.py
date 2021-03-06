"""
    This controller handles the routing for search heritage items
"""

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly, AllowAny
from rest_framework.response import Response

from api.models import Heritage
from api.serializer.heritage import HeritageSerializer
from api.service import heritage
from api.service.search import calculate_scores, consecutive_subsequences
from api.service.helper import get_concepts_from_list
import operator


@api_view(['POST'])
@permission_classes((AllowAny, ))
def search(request):
    """
    basic search => for given one or more words
    advanced search => extra filters like location, creator or date
    search heritage items for given words and filters

    :param request: client request
    :return: list of heritage items
    :rtype: JSONArray
    """
    query_words = request.data['query'].split(' ')
    filters = request.data.get('filters', None)
    query_combinations = consecutive_subsequences(query_words)

    ll = {}

    for index in range(len(query_combinations)):
        #print search.get_items_by_tag(tag=query_combinations[index])
        score_list = calculate_scores(query_combinations[index], filters)

        for iter in score_list:
            if iter[0] in ll.keys():
                ll[iter[0]] += iter[1]
            else:
                ll[iter[0]] = iter[1]

    query_related = get_concepts_from_list(query_words)

    for index in range(len(query_related)):
        #print search.get_items_by_tag(tag=query_combinations[index])
        score_list = calculate_scores(query_related[index][0], filters)

        for iter in score_list:
            if iter[0] in ll.keys():
                ll[iter[0]] += iter[1]/2
            else:
                ll[iter[0]] = iter[1]/2

    sorted_tuple = sorted(ll.items(), key=operator.itemgetter(1), reverse=True)
    print sorted_tuple
    for index in range(len(sorted_tuple)):
        if sorted_tuple[index][1] < 3:
            sorted_tuple = sorted_tuple[:index]
            break

    response = []

    for item in sorted_tuple:
        heritage_item = heritage.get_item_by_id(heritage_id=item[0])
        serializer = HeritageSerializer(heritage_item)
        response.append(serializer.data)
    #return Response(serializer.data, status=status.HTTP_200_OK)

    return Response(response, status=status.HTTP_200_OK)

