<?php

namespace App\ProductsBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;

class ProductsController extends Controller
{
    /**
     * @Template()
     */
    public function indexAction()
    {
        $em       = $this->getDoctrine()->getManager();
        $products = $em->getRepository('AppProductsBundle:Products')->findBy([], null, 10);
        $photos   = $em->getRepository('AppProductsBundle:ProductsPhoto');

        foreach ($products as $product) {
            $photoList = $photos->findBy(array('product_id' => $product->getId()));

            foreach ($photoList as $element) {
                $product->addPhoto($element);
            }
        }

        return array('products' => $products);
    }

}
